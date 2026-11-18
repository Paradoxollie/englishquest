const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createShopFixture, player, second } = require("./collection-shop-postgres.cjs");

const root = path.resolve(__dirname, "../..");
const dir = path.join(root, "supabase/migrations");
const files = fs.readdirSync(dir).filter(name => name.endsWith("_character_roster_and_starter_avatars.sql"));
assert.equal(files.length, 1);
const roster = fs.readFileSync(path.join(dir, files[0]), "utf8");
const veteran = "00000000-0000-4000-8000-000000000053";
const newcomer = "00000000-0000-4000-8000-000000000054";

async function run() {
  const db = await createShopFixture();
  const all = async (sql, args = []) => (await db.query(sql,args)).rows;
  const row = async (sql, args = []) => (await all(sql,args))[0];
  const id = async key => (await row("select id from shop_items where item_key=$1",[key])).id;
  const equip = (who, kind, itemId) => row("select equip_shop_item($1,$2,$3) as result",[who,itemId,kind]);
  const buy = (who, itemId) => row("select purchase_shop_item($1,$2) as result",[who,itemId]);
  const outfits = () => all("select user_id,equipped_avatar_id,equipped_background_id,equipped_title_id,equipped_ship_skin_id from user_equipped_items order by user_id");
  const wallets = () => all("select id,gold,level,xp from profiles order by id");
  const otherPieces = () => all("select * from shop_items where item_type<>'avatar' order by id");
  const paidOrders = () => all("select * from user_items where price_paid>0 order by id");
  try {
    await db.query("insert into profiles(id,gold,level,xp) values ($1,30,1,0),($2,30,1,0)",[veteran,newcomer]);
    for (const [key,name,gold,level] of [
      ["avatar_default","Ancien défaut homme",0,1],["avatar_d_faut_femme_1763206735902","Ancien défaut femme",0,1],
      ["avatar_dragon_warrior","Ancien dragon",100,10],["avatar_ranger","Ancien éclaireur",50,5],
    ]) await db.query("insert into shop_items(item_key,name,item_type,price_gold,required_level,image_url,is_public) values($1,$2,'avatar',$3,$4,'/ancien.webp',false)",[key,name,gold,level]);

    const legacyMale = await id("avatar_default"), legacyFemale = await id("avatar_d_faut_femme_1763206735902");
    const dragon = await id("avatar_dragon_warrior"), junior = await id("eq_depart_sam"), founder = await id("eq_depart_maya");
    const paidAlma = await id("eq_enquete_maya"), setTitle = await id("eq_enquete_album");
    const bg = await id("eq_depart_quais"), ship = await id("eq_depart_comete");
    await db.query("update user_equipped_items set equipped_avatar_id=$1,equipped_ship_skin_id=$2,equipped_background_id=$3 where user_id=$4",[legacyMale,ship,bg,player]);
    await db.query("update user_equipped_items set equipped_avatar_id=$1 where user_id=$2",[legacyFemale,second]);
    await db.query("insert into user_equipped_items(user_id,equipped_avatar_id) values ($1,$2)",[veteran,dragon]);
    await db.query("insert into user_items(user_id,shop_item_id,price_paid) values ($1,$2,0),($3,$4,80),($3,$5,25)",[player,legacyMale,veteran,dragon,paidAlma]);
    // A completed album that had not yet had its prize recorded.
    await db.query("update profiles set level=3 where id=$1",[second]);
    await db.query("insert into user_items(user_id,shop_item_id,price_paid) select $1,id,price_gold from shop_items where collection_key='enquete' and price_gold>0",[second]);
    const beforeMoney = await wallets(), beforeShop = await otherPieces(), beforePaid = await paidOrders();

    await db.exec(roster);
    assert.deepEqual(await wallets(), beforeMoney);
    assert.deepEqual(await otherPieces(), beforeShop);
    assert.deepEqual(await paidOrders(), beforePaid);
    const heroes = await all("select * from shop_items where is_public and is_active and item_type='avatar' order by required_level,price_gold,display_order");
    assert.equal(heroes.length,12);
    assert.equal(new Set(heroes.map(h => h.image_url)).size,12);
    assert.equal(new Set(heroes.map(h => h.name)).size,12);
    assert.equal(heroes[0].price_gold,0);
    assert.equal(heroes.at(-1).item_key,"eq_aurore_zenith");
    assert.deepEqual([heroes.at(-1).required_level,heroes.at(-1).price_gold],[20,220]);
    for (const hero of heroes) {
      assert.match(hero.image_url,/^\/art\/personnages\/[a-z0-9]+-visage\.webp$/);
      for (const suffix of ["-visage.webp","-silhouette.webp"]) {
        const file = fs.readFileSync(path.join(root,"public",hero.image_url.replace("-visage.webp",suffix)));
        assert.equal(file.toString("ascii",8,12),"WEBP",hero.name);
        assert.ok(file.subarray(12).includes(Buffer.from("ALPH")) || file.toString("ascii",12,16)==="VP8L",hero.name+" détouré");
      }
    }
    assert.equal(await id("eq_enquete_maya"),paidAlma);
    const equipped = await outfits();
    assert.equal(equipped.find(e=>e.user_id===player).equipped_avatar_id,junior);
    assert.equal(equipped.find(e=>e.user_id===second).equipped_avatar_id,founder);
    assert.equal(equipped.find(e=>e.user_id===player).equipped_background_id,bg);
    assert.equal(equipped.find(e=>e.user_id===player).equipped_ship_skin_id,ship);
    assert.equal(equipped.find(e=>e.user_id===veteran).equipped_avatar_id,dragon);
    assert.equal(equipped.find(e=>e.user_id===newcomer),undefined);
    assert.equal((await row("select image_url from shop_items where id=$1",[dragon])).image_url,"/art/personnages/silex-visage.webp");
    const initialInventory = await all("select id,user_id,shop_item_id,price_paid from user_items order by id");
    assert.ok(initialInventory.some(i=>i.user_id===second && i.shop_item_id===founder));
    assert.ok(initialInventory.some(i=>i.user_id===second && i.shop_item_id===setTitle));
    await db.exec(roster);
    assert.deepEqual(await outfits(),equipped);
    assert.deepEqual(await all("select id,user_id,shop_item_id,price_paid from user_items order by id"),initialInventory);
    assert.deepEqual(await wallets(),beforeMoney);
    await db.exec("set role service_role");
    assert.equal((await equip(veteran,"avatar",dragon)).result.success,true);
    assert.equal((await equip(second,"title",setTitle)).result.success,true);
    assert.equal((await buy(newcomer,paidAlma)).result.newGold,5);
    assert.equal((await buy(newcomer,paidAlma)).result.newGold,5);
    const legendary = await id("eq_aurore_zenith");
    await db.query("update profiles set level=19,gold=400 where id=$1",[newcomer]);
    assert.equal((await buy(newcomer,legendary)).result.success,false);
    await db.query("update profiles set level=20,gold=219 where id=$1",[newcomer]);
    assert.equal((await buy(newcomer,legendary)).result.success,false);
    await db.query("update profiles set gold=220 where id=$1",[newcomer]);
    assert.equal((await buy(newcomer,legendary)).result.newGold,0);
    assert.equal((await equip(newcomer,"avatar",legendary)).result.success,true);
    console.log("PASS 12 distinct characters, 24 illustrations, level and gold gates, original purchase receipts, earned album titles and legacy default replacements.");
  } finally {
    await db.close();
  }
}
run().catch(error => { console.error(error); process.exitCode=1; });

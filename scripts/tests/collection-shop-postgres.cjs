// Real PostgreSQL semantics in memory. The fixture never uses project credentials.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { PGlite } = require("@electric-sql/pglite");
const root = path.resolve(__dirname, "../..");
const migrations = path.join(root, "supabase", "migrations");
const matches = fs.readdirSync(migrations).filter(name => name.endsWith("_illustrated_reward_collections.sql"));
assert.equal(matches.length, 1);
const migration = fs.readFileSync(path.join(migrations, matches[0]), "utf8");
const player = "00000000-0000-4000-8000-000000000001";
const second = "00000000-0000-4000-8000-000000000002";
const originalAvatar = "00000000-0000-4000-8000-000000000010";
const personal = "00000000-0000-4000-8000-000000000011";

async function createShopFixture() {
  const db = new PGlite();
  await db.exec(`
    create schema auth;
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create table profiles(id uuid primary key, gold integer not null, level integer not null, xp integer not null, updated_at timestamptz default now());
    create table shop_items(id uuid primary key default gen_random_uuid(), item_key text unique not null, name text not null,
      item_type text not null, description text, price_gold integer not null, required_level integer not null, display_order integer default 0,
      image_url text, color_theme text, is_active boolean not null default true, is_public boolean not null default true,
      owner_user_id uuid, created_at timestamptz default now(), updated_at timestamptz default now());
    create table user_items(id uuid primary key default gen_random_uuid(),user_id uuid references profiles(id),shop_item_id uuid references shop_items(id),
      price_paid integer not null, purchased_at timestamptz default now(), unique(user_id,shop_item_id));
    create table user_equipped_items(user_id uuid primary key references profiles(id),equipped_avatar_id uuid references shop_items,
      equipped_background_id uuid references shop_items,equipped_title_id uuid references shop_items,equipped_ship_skin_id uuid references shop_items, updated_at timestamptz default now());
    grant usage on schema public,auth to anon, authenticated, service_role;
    grant all on all tables in schema public to service_role;
    grant select on shop_items,user_items,user_equipped_items to authenticated;
    grant select on shop_items to anon;
    alter table shop_items enable row level security;
    create policy visible on shop_items for select using (is_public and is_active);
    alter table user_items enable row level security;
    create policy own on user_items for select to authenticated using (user_id = (select auth.uid()));
    insert into profiles values ('${player}',30,1,0,now()), ('${second}',15,1,0,now());
    insert into shop_items(id,item_key,name,item_type,price_gold,required_level,is_public) values
      ('${originalAvatar}','avatar_warrior','Ancien portrait','avatar',40,2,true),
      ('${personal}','custom_test','Portrait personnel','avatar',0,1,false);
    insert into user_equipped_items(user_id,equipped_avatar_id) values ('${player}','${originalAvatar}');
    insert into user_items(user_id,shop_item_id,price_paid) values ('${player}','${personal}',0);
    insert into shop_items(item_key,name,item_type,price_gold,required_level,owner_user_id,is_public) values
      ('custom_owned_without_receipt','Portrait privé','avatar',0,1,'${second}',false),
      ('custom_equipped_without_receipt','Ancien décor privé','background',0,1,null,true);
    insert into user_equipped_items(user_id,equipped_background_id)
      select '${second}',id from shop_items where item_key='custom_equipped_without_receipt';
  `);
  await db.exec(migration);
  return db;
}

async function run() {
  const db = await createShopFixture();
  try {
    await db.exec(migration);
    const first = async (sql, params = []) => (await db.query(sql, params)).rows[0];
    const all = (await db.query("select * from shop_items where collection_key is not null order by display_order")).rows;
    assert.equal(all.length, 23);
    assert.equal(new Set(all.map(p => p.collection_key)).size, 4);
    assert.equal(all.filter(item => item.is_collection_reward).length, 4);
    for (const item of all.filter(piece => piece.item_type !== "title")) {
      const file = path.join(root, "public", item.image_url);
      assert.ok(fs.statSync(file).size > 1000, item.item_key);
      assert.equal(fs.readFileSync(file).toString("ascii", 8, 12), "WEBP", file);
    }
    const id = key => all.find(item => item.item_key === key).id;
    const buy = async (key, who = player) => (await first("select purchase_shop_item($1,$2) as receipt", [who, id(key)])).receipt;
    const equip = async (item, type, who = player) => (await first("select equip_shop_item($1,$2,$3) as receipt", [who, item, type])).receipt;
    const holdings = async () => Number((await first("select count(*) as n from user_items where user_id=$1", [player])).n);
    await db.exec("set role service_role");
    assert.equal((await first("select count(*)::int as n from user_items ui join shop_items s on s.id=ui.shop_item_id where ui.user_id=$1 and s.item_key in ('custom_owned_without_receipt','custom_equipped_without_receipt') and not s.is_public",[second])).n,2);
    assert.equal((await first("select is_public from shop_items where id=$1",[originalAvatar])).is_public, false);
    assert.equal(await holdings(), 2, "Keeps a previously equipped item even without an old receipt");
    assert.equal((await equip(personal, "avatar", second)).success, false);
    assert.equal((await equip(personal, "avatar")).success, true);
    assert.equal((await equip(originalAvatar, "avatar")).success, true);
    assert.equal((await equip(id("eq_depart_album"),"title")).success, false);
    assert.equal((await buy("eq_depart_album")).success, false);
    assert.equal((await buy("eq_aurore_vaisseau")).success, false);
    assert.equal((await equip(id("eq_enquete_indice"), "title")).success, false, "Free pieces still require their level");
    assert.equal((await equip(id("eq_depart_quais"), "background")).success, false);
    assert.equal((await equip(id("eq_depart_maya"), "background")).success, false);
    assert.equal((await equip(id("eq_depart_quais"), "background",second)).success, false);
    assert.equal((await buy("eq_depart_quais",second)).success,false,"Insufficient gold cannot be spent");
    await db.exec("begin");
    assert.equal((await buy("eq_depart_quais")).success,true);
    await db.exec("rollback");
    assert.equal((await first("select gold from profiles where id=$1", [player])).gold,30);
    assert.equal(await holdings(), 2);
    const receipts = await Promise.all([buy("eq_depart_quais"), buy("eq_depart_quais")]);
    assert.ok(receipts.every(receipt => receipt.success && receipt.newGold === 12));
    assert.deepEqual(receipts.flatMap(receipt => receipt.unlockedTitles.map(title => title.item_key)), ["eq_depart_album"]);
    assert.equal(await holdings(), 4);
    assert.equal((await equip(id("eq_depart_album"), "title")).success, true);
    await Promise.all([equip(id("eq_depart_comete"), "ship_skin"), equip(id("eq_depart_quais"), "background")]);
    await equip(null,"background");
    const worn = await first("select * from user_equipped_items where user_id=$1",[player]);
    assert.equal(worn.equipped_ship_skin_id,id("eq_depart_comete"));
    assert.equal(worn.equipped_title_id,id("eq_depart_album"));
    assert.equal(worn.equipped_background_id,null);
    assert.equal(worn.equipped_avatar_id,originalAvatar);
    await db.query("update profiles set xp=3400, level=18, gold=600 where id=$1",[second]);
    for(const piece of all.filter(p => p.collection_key === "aurore" && p.price_gold > 0)) {
      assert.equal((await buy(piece.item_key,second)).success,true);
    }
    assert.equal((await equip(id("eq_aurore_album"),"title",second)).success,true);
    await db.query("update shop_items set is_active=false, is_public=false where id=$1",[id("eq_aurore_album")]);
    assert.equal((await equip(id("eq_aurore_album"),"title",second)).success,true,"A collected title survives retirement");
    await db.query("update shop_items set price_gold=0, required_level=19 where collection_key='enquete' and not is_collection_reward");
    assert.equal((await first("select count(*)::int as n from user_items where user_id=$1 and shop_item_id=$2",[second,id("eq_enquete_album")])).n,0);
    await db.query("update profiles set level=19 where id=$1",[second]);
    assert.equal((await first("select count(*)::int as n from user_items where user_id=$1 and shop_item_id=$2",[second,id("eq_enquete_album")])).n,1,"An album completed by a level gain is granted without a shop visit");
    await db.query("update shop_items set required_level=20 where collection_key='enquete' and not is_collection_reward");
    assert.equal((await equip(id("eq_enquete_album"),"title",second)).success,true);
    await db.exec("reset role");
    for(const role of ["anon","authenticated"]) {
      for (const proc of ["collect_titles_after_level_up()","grant_completed_shop_titles(uuid)","purchase_shop_item(uuid,uuid)","equip_shop_item(uuid,uuid,text)"]) {
        assert.equal((await first("select has_function_privilege($1,$2,'execute') as allowed",[role,proc])).allowed,false);
      }
    }
    await db.exec("set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)",[player]);
    assert.equal((await first("select id from shop_items where id=$1",[originalAvatar])).id,originalAvatar);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)",[second]);
    assert.equal(await first("select id from shop_items where id=$1",[originalAvatar]),undefined);
    console.log("PASS 23 illustrated rewards, starter choice, level and album unlocks, private and legacy ownership, transactional purchases and independent equipment slots.");
  } finally { await db.close(); }
}
module.exports = { createShopFixture, player, second, originalAvatar };
if (require.main === module) run().catch(error => { console.error(error); process.exitCode = 1; });

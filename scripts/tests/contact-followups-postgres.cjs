// Exercise the real migration and reply function in a disposable database.
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { PGlite } = require("@electric-sql/pglite");

async function run() {
  const db = new PGlite();
  const admin = randomUUID(), member = randomUUID(), guestThread = randomUUID(), accountThread = randomUUID();
  const day = "2026-10-10T15:00:00.000Z";
  const one = async (query, args = []) => (await db.query(query, args)).rows[0];
  const row = id => one("select * from public.contact_messages where id=$1", [id]);
  async function append(thread, request, body, team, actor, key = null) {
    return (await one("select public.append_contact_followup($1,$2,$3,$4,$5,$6) as result", [thread,request,body,team,actor,key])).result;
  }
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create table public.profiles(id uuid primary key, role text not null);
      create table public.contact_messages(id uuid primary key default gen_random_uuid(), name text, email text,
        subject text, message text, read boolean default false, replied boolean default false,
        created_at timestamptz default now(), updated_at timestamptz default now(), user_id uuid,
        reply text, replied_by uuid, replied_at timestamptz);
      alter table public.contact_messages enable row level security;
      grant all on all tables in schema public to service_role;
      grant select on public.contact_messages to anon, authenticated;`);
    await db.query("insert into public.profiles values ($1,'admin'),($2,'student')",[admin,member]);
    await db.query("insert into public.contact_messages(id,reply,replied,replied_at,replied_by) values ($1,'Réponse initiale',true,$2,$3)",[guestThread,day,admin]);
    await db.query("insert into public.contact_messages(id,user_id) values ($1,$2)",[accountThread,member]);
    const dir = path.join(__dirname, "../../supabase/migrations");
    const migration = fs.readdirSync(dir).find(name => name.endsWith("_contact_reply_threads.sql"));
    await db.exec(fs.readFileSync(path.join(dir, migration), "utf8"));
    for (const role of ["anon", "authenticated", "service_role"]) {
      const acl = await one(`select has_column_privilege($1,'public.contact_messages','guest_receipt_key','select') as key,
        has_column_privilege($1,'public.contact_messages','subject','select') as subject,
        has_function_privilege($1,'public.append_contact_followup(uuid,uuid,text,boolean,uuid,uuid)','execute') as append,
        has_table_privilege($1,'public.contact_followups','select') as history`,[role]);
      const server = role === "service_role";
      assert.deepEqual(acl, {key:server, subject:true, append:server, history:server});
    }
    await db.exec("set role service_role");
    const original = await row(guestThread);
    assert.equal(original.reply, "Réponse initiale");
    assert.equal(original.replied_at.toISOString(), day);
    assert.equal(original.guest_receipt_issued, false);
    assert.ok(original.reply_notice && original.guest_receipt_key);
    assert.notEqual((await row(accountThread)).guest_receipt_key, original.guest_receipt_key);
    const fresh = await one("insert into public.contact_messages(guest_receipt_issued) values(true) returning *");
    assert.equal(fresh.reply_notice, null);
    assert.ok(fresh.guest_receipt_key && fresh.guest_receipt_issued);

    const request = randomUUID();
    assert.equal(await append(guestThread,request,"Suite",true,admin),"ok");
    assert.equal(await append(guestThread,request,"Suite",true,admin),"ok");
    assert.equal(await append(guestThread,request,"Autre texte",true,admin),"invalid");
    assert.equal((await one("select count(*)::int as n from public.contact_followups where message_id=$1",[guestThread])).n,1);
    const answered = await row(guestThread);
    assert.equal(answered.reply,original.reply);
    assert.equal(answered.replied_at.toISOString(),day);
    assert.equal(answered.reply_notice,request);
    assert.equal(answered.reply_acknowledged_at,null);
    assert.equal(await append(guestThread,randomUUID(),"Compte visiteur",false,member),"unavailable");
    assert.equal(await append(accountThread,randomUUID(),"Autre lecteur",false,null,original.guest_receipt_key),"unavailable");
    assert.equal(await append(accountThread,randomUUID(),"Équipe",true,member),"unavailable");
    assert.equal(await append(accountThread,randomUUID(),"Ma question",false,member),"ok");
    assert.equal(await append(accountThread,randomUUID(),"Réponse au membre",true,admin),"ok");
    const acknowledge = (id,notice) => db.query("update public.contact_messages set reply_notice=null, reply_acknowledged_at=now() where id=$1 and reply_notice=$2 returning id",[id,notice]);
    assert.equal((await acknowledge(guestThread,original.reply_notice)).rows.length,0);
    assert.equal((await acknowledge(guestThread,request)).rows.length,1);
    assert.ok((await row(guestThread)).reply_acknowledged_at);
    for (let i=1;i<=3;i++) assert.equal(await append(guestThread,randomUUID(),"Précision "+i,false,null,original.guest_receipt_key),"ok");
    assert.equal(await append(guestThread,randomUUID(),"Encore",false,null,original.guest_receipt_key),"rate_limited");
    assert.equal((await row(guestThread)).read,false);
    assert.equal(await append(guestThread,randomUUID(),"Dernière réponse",true,admin),"ok");
    assert.equal((await row(guestThread)).reply_acknowledged_at,null);
    await db.query("delete from public.contact_messages where id=$1",[guestThread]);
    assert.equal((await one("select count(*)::int as n from public.contact_followups where message_id=$1",[guestThread])).n,0);
    console.log("ok - private contact follow-ups, old replies, access, notices, acknowledgments and retries");
  } finally {
    await db.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { PGlite } = require("@electric-sql/pglite");
const migrations = path.resolve(__dirname, "../../supabase/migrations");

async function run() {
  const db = new PGlite();
  const rows = async query => (await db.query(query)).rows;
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create table public.profiles(id uuid, username text, role text, xp integer, gold integer,level integer,created_at timestamptz);
      create table public.site_visits(visited_at timestamptz, visit_date date, visitor_hash text,user_id uuid, path text default '/');
      create table public.class_guests(id integer primary key,token_hash text,access_until timestamptz,report_until timestamptz);
      create table public.class_guest_work(guest_id integer references public.class_guests on delete cascade);
      create table public.class_guest_join_limits(expires_at timestamptz);
      create table public.class_live_sessions(stopped_at timestamptz,ends_at timestamptz,created_at timestamptz);
      insert into public.site_visits(visited_at,visit_date,visitor_hash,user_id) values(now()-interval '16 days',current_date-16,'a',null),
        (now()-interval '16 days',current_date-16,'a',null),(now()-interval '16 days',current_date-16,'b',null),
        (now(),current_date,'a',null);
      update public.site_visits set path='/play/grammar-rush?ref=invitation' where visitor_hash='a';
      insert into public.site_visits values(now()-interval '16 days',current_date-16,'b',gen_random_uuid(),'/play/grammar-rush');
      insert into public.class_guests values(1,'old',now()-interval '11 days',now()-interval '1 day'),
        (2,'expired',now()-interval '1 hour',now()+interval '9 days'),(3,'current',now()+interval '1 hour',now()+interval '10 days');
      insert into public.class_guest_work values(1),(2),(3);
      insert into public.class_guest_join_limits values(now()-interval '1 minute'),(now()+interval '1 hour');
      insert into public.class_live_sessions values(null,now()-interval '11 days',now()-interval '11 days'),
        (null,now()-interval '9 days',now()-interval '9 days');`);
    const file = fs.readdirSync(migrations).find(f => f.endsWith("_guest_data_retention.sql"));
    await db.exec(fs.readFileSync(path.join(migrations,file),"utf8"));
    const apply = async suffix => db.exec(fs.readFileSync(path.join(migrations,fs.readdirSync(migrations).find(f=>f.endsWith(suffix))),"utf8"));
    await apply("_daily_guest_game_activity.sql");
    await db.exec("select public.purge_temporary_class_data()");
    assert.deepEqual(await rows("select id,token_hash from class_guests order by id"),[{id:2,token_hash:null},{id:3,token_hash:"current"}]);
    assert.deepEqual(await rows("select guest_id from class_guest_work order by guest_id"),[{guest_id:2},{guest_id:3}]);
    assert.equal((await rows("select count(*)::int as n from class_live_sessions"))[0].n,1);
    assert.equal((await rows("select count(*)::int as n from class_guest_join_limits"))[0].n,1);
    assert.equal((await rows("select count(*)::int as n from site_visits"))[0].n,5,"old detail kept until archived");
    await apply("_preserve_past_visit_totals.sql");
    const activity = "select play_date,game_slug,openings::int,started::int,finished::int from public.game_usage_between(current_date-30,current_date+1)";
    const before = await rows(activity);
    await db.exec("select public.purge_temporary_class_data(); select public.purge_temporary_class_data()");
    assert.deepEqual(await rows("select unique_visitors::int,total_visits::int from site_visit_days"),[{unique_visitors:2,total_visits:4}]);
    assert.deepEqual(await rows(activity),before,"archived game openings survive removal without double counting");
    assert.equal(before.reduce((n,r)=>n+r.openings,0),4);
    assert.equal((await rows("select count(*)::int as n from site_visits"))[0].n,2);
    assert.equal((await rows("select count(*)::int as n from site_visits where user_id is not null"))[0].n,1);
    await db.exec("select public.count_guest_game('grammar-rush','started'); select public.count_guest_game('grammar-rush','finished')");
    assert.deepEqual(await rows("select started::int,finished::int from public.guest_game_days"),[{started:1,finished:1}]);
    assert.equal((await rows(activity)).reduce((n,r)=>n+r.started+r.finished,0),2);
    await assert.rejects(db.exec("select public.count_guest_game('unknown','started')"));
    assert.equal((await rows("select has_function_privilege('anon','public.count_guest_game(text,text)','execute') as allowed"))[0].allowed,false);
    const summary = (await rows("select public.admin_dashboard_summary(current_date) as s"))[0].s;
    assert.equal(summary.visitors.totalVisits,5);
    assert.equal(summary.visitors.totalUniqueVisitors,1);
    assert.equal(summary.visitors.dailyStats.length,2);
    console.log("PASS Ten-day classroom retention, faster credential expiry, cascade, daily traffic totals and repeated cleanup");
  } finally { await db.close(); }
}
run().catch(error => { console.error(error); process.exitCode=1; });

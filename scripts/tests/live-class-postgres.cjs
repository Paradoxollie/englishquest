// Exercises the production room transaction with a disposable PostgreSQL database.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { PGlite } = require("@electric-sql/pglite");

async function run() {
  const db = new PGlite();
  const [teacher, other, ada, tom, staff, outsider, classroom, elsewhere] = Array.from({ length: 8 }, () => randomUUID());
  const game = { kind: "game", slug: "wordfall", durationSeconds: 30 };
  const course = { kind: "course", courseId: 1, durationSeconds: 30 };
  const plan = [game, course];
  const dir = path.join(__dirname, "../../supabase/migrations");
  const files = fs.readdirSync(dir).filter((file) => file.endsWith("_live_class_sessions.sql"));
  assert.equal(files.length, 1);
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create table public.profiles(id uuid primary key, username text, role text);
      create table public.classes(id uuid primary key, teacher_id uuid, name text, code text, archived_at timestamptz);
      create table public.class_members(class_id uuid, user_id uuid, joined_at timestamptz default now(), primary key(class_id,user_id));
      create table public.game_scores(user_id uuid, created_at timestamptz);
      create table public.user_course_progress(user_id uuid, status text, completed_at timestamptz, best_score integer);
      grant all on all tables in schema public to service_role;
      insert into public.profiles values
        ('${teacher}','Enseignant','teacher'),('${other}','Collègue','teacher'),('${ada}','Ada','student'),
        ('${tom}','Tom','student'),('${staff}','Gestion','admin'),('${outsider}','Autre','student');
      insert into public.classes values ('${classroom}','${teacher}','Anglais','AAAA22',null),('${elsewhere}','${other}','Club','BBBB33',null);
      insert into public.class_members values ('${classroom}','${ada}',now()-interval '2 days'),('${classroom}','${tom}',now()-interval '2 days'),
        ('${elsewhere}','${outsider}',now()-interval '2 days');
    `);
    await db.exec(fs.readFileSync(path.join(dir, files[0]), "utf8"));
    const weekly = fs.readdirSync(dir).find(file => file.endsWith("_count_played_class_missions.sql"));
    await db.exec(fs.readFileSync(path.join(dir, weekly), "utf8"));
    const sql = (s,p=[]) => db.query(s,p);
    const rpc = async (user,action="state",session=null,rounds=null,index=null,progress=null,room=classroom) =>
      (await sql("select public.class_live_request($1,$2,$3,$4,$5,$6,$7) as state",
        [user,room,action,session,rounds===null?null:JSON.stringify(rounds),index,progress===null?null:JSON.stringify(progress)])).rows[0].state;
    await db.exec("set role service_role");
    assert.equal((await rpc(teacher)).session,null);
    await assert.rejects(rpc(other),/live_unavailable/);
    await assert.rejects(rpc(outsider),/live_unavailable/);
    await assert.rejects(rpc(ada,"prepare",null,plan),/live_unavailable/);
    const lobby = await rpc(teacher,"prepare",null,plan);
    const key = lobby.session.id;
    assert.equal(lobby.code,"AAAA22");
    assert.equal((await rpc(teacher,"prepare",null,plan)).session.id,key);
    await assert.rejects(rpc(teacher,"prepare",null,[game]),/live_in_progress/);
    for (const person of [ada,tom]) {
      const waiting = await rpc(person,"pulse",key);
      assert.equal(waiting.code,null);
      assert.deepEqual(waiting.people,[]);
      assert.equal(waiting.self.points,0);
    }
    assert.equal((await rpc(teacher)).people.length,2);
    const launch = await rpc(teacher,"start",key);
    assert.equal(launch.session.startsAt-launch.serverNow,12000);
    assert.equal((await rpc(staff,"start",key)).session.startsAt,launch.session.startsAt);
    assert.equal((await rpc(ada,"pulse",key,null,0,{answered:2,correct:2})).self.points,0);
    // Move only the fixture clock relative to the immutable offsets in the plan.
    async function at(seconds) {
      await sql("update public.class_live_sessions set starts_at=now()-$2*interval '1 second',ends_at=now()+(60-$2)*interval '1 second' where id=$1",[key,seconds]);
      await sql("update public.class_live_people set joined_at=now()-interval '2 minutes' where session_id=$1",[key]);
    }
    await at(15);
    await rpc(ada,"pulse",key,null,0,{answered:4,correct:3});
    await rpc(tom,"pulse",key,null,0,{answered:3,correct:3});
    const tied = await rpc(teacher);
    assert.deepEqual(tied.people.map(p=>[p.rank,p.points]),[[1,100],[1,100]]);
    assert.equal((await rpc(ada,"pulse",key,null,0,{answered:1,correct:0})).self.correct,3);
    await at(45);
    await rpc(ada,"pulse",key,null,0,{answered:30,correct:30});
    assert.equal((await rpc(ada)).self.points,100,"late data cannot rewrite the previous round");
    const noCredit = await rpc(ada,"pulse",key,null,1,{answered:11,correct:11});
    assert.equal(noCredit.self.correct,0,"courses require per-exercise marks from the grader");
    const marks = [{id:"1",choice:0,ok:true},{id:"2",text:"example",ok:false}];
    const answered = await rpc(ada,"pulse",key,null,1,{courseId:1,marks});
    assert.equal(answered.self.correct,1);
    assert.deepEqual(answered.self.answers,[{id:"1",choice:0},{id:"2",text:"example"}]);
    const duplicate = await rpc(ada,"pulse",key,null,1,{courseId:1,marks:[{id:"2",text:"replacement",ok:true}]});
    assert.equal(duplicate.self.correct,1);
    assert.deepEqual((await rpc(tom)).people,[]);
    await at(62);
    const last = await rpc(tom,"pulse",key,null,1,{courseId:1,marks:[{id:"1",choice:1,ok:false}]});
    assert.equal(last.self.answered,1,"accepts an in-flight last answer");
    assert.deepEqual(last.people.map(p=>[p.name,p.rank,p.points]),[["Ada",1,200],["Tom",2,100]]);
    assert.ok(last.people.every(p=>p.results===undefined && p.answers===undefined));
    const end = await rpc(teacher);
    assert.equal(end.history[0].id,key);
    assert.deepEqual(end.people[0].results.map(r=>r.correct),[3,1]);
    await at(71);
    assert.equal((await rpc(tom,"pulse",key,null,1,{courseId:1,marks:[{id:"3",choice:0,ok:true}]})).self.correct,0);
    await assert.rejects(rpc(other,"state",key),/live_unavailable/);
    const second = await rpc(teacher,"prepare",null,[game]);
    assert.notEqual(second.session.id,key);
    assert.equal((await rpc(teacher,"state",key)).people.length,2);
    await rpc(teacher,"stop",second.session.id);
    assert.equal((await rpc(ada)).session,null,"unattended, closed rooms have no public podium");
    await sql("insert into public.game_scores values ($1,now()-interval '3 days'),($1,now()-interval '1 day')",[ada]);
    await sql(`insert into public.user_course_progress values
      ($1,'completed',now(),10010008),($1,'completed',now(),null),($1,'completed',now(),8000000),
      ($1,'completed',now(),20010003),($1,'in_progress',now(),9010003),($1,'completed',now()-interval '4 days',10010010)`,[ada]);
    const freeWork = await sql("select * from public.class_practice_week($1,$2)",[teacher,classroom]);
    assert.equal(Number(freeWork.rows.find(p=>p.pupil==="Ada").games),1);
    assert.equal(Number(freeWork.rows.find(p=>p.pupil==="Ada").missions),2,"only played missions since joining, including old records");
    assert.equal((await sql("select * from public.class_practice_week($1,$2)",[other,classroom])).rows.length,0);
    await sql("delete from public.class_members where class_id=$1 and user_id=$2",[classroom,ada]);
    assert.equal((await rpc(teacher,"state",key)).people.length,1);
    await assert.rejects(rpc(ada),/live_unavailable/);
    const group = Array.from({length:30},()=>randomUUID());
    await sql("insert into public.profiles select id,'Groupe '||n,'student' from unnest($1::uuid[]) with ordinality p(id,n)",[group]);
    await sql("insert into public.class_members(class_id,user_id) select $1,id from unnest($2::uuid[]) p(id)",[elsewhere,group]);
    const groupRoom = (await rpc(other,"prepare",null,[game],null,null,elsewhere)).session.id;
    await Promise.all(group.map(id=>rpc(id,"pulse",groupRoom,null,null,null,elsewhere)));
    assert.equal((await rpc(other,"state",groupRoom,null,null,null,elsewhere)).people.length,30);
    await rpc(other,"start",groupRoom,null,null,null,elsewhere);
    await sql("update public.class_live_sessions set starts_at=now()-interval '10 seconds',ends_at=now()+interval '20 seconds' where id=$1",[groupRoom]);
    await sql("update public.class_live_people set joined_at=now()-interval '20 seconds' where session_id=$1",[groupRoom]);
    await Promise.all(group.map((id,i)=>rpc(id,"pulse",groupRoom,null,0,{answered:i+1,correct:i+1},elsewhere)));
    const groupBoard = await rpc(other,"state",groupRoom,null,null,null,elsewhere);
    assert.equal(groupBoard.people.length,30);
    assert.equal(groupBoard.people[0].correct,30);
    assert.equal(groupBoard.people.at(-1).rank,30);
    await db.exec("reset role; set role authenticated");
    assert.equal((await sql("select has_function_privilege(current_user,'public.class_live_request(uuid,uuid,text,uuid,jsonb,integer,jsonb)','execute') as allowed")).rows[0].allowed,false);
    console.log("PASS Live classroom: clock, grader, ties, history, privacy and a second group of 30 simultaneous simulated players");
  } finally { await db.close(); }
}
run().catch(error=>{ console.error(error); process.exitCode=1; });

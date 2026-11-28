const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { PGlite } = require("@electric-sql/pglite");

async function run() {
  const db = new PGlite();
  try {
    await db.exec(`
      create schema auth;
      create role anon; create role authenticated; create role service_role bypassrls;
      create table auth.users(id uuid primary key);
      create table profiles(id uuid primary key,role text,username text);
      create table classes(id uuid primary key,teacher_id uuid,name text);
      create table class_members(class_id uuid,user_id uuid,joined_at timestamptz);
      create table courses(id uuid primary key,course_number int unique);
      create table user_course_progress(id uuid primary key,user_id uuid,course_id uuid,status text,best_score int,completed_at timestamptz,updated_at timestamptz);
      create table games(id uuid primary key,slug text);
      create table game_scores(id uuid primary key,user_id uuid,game_id uuid,score int,difficulty text,created_at timestamptz);
      create table adventure_checkpoints(user_id uuid,mission int,stage int,updated_at timestamptz,draft jsonb);
    `);
    await db.exec(
      fs.readFileSync(
        path.join(__dirname, "../../supabase/migrations/20261128145417_learner_activity_reports.sql"),
        "utf8",
      ),
    );
    const [admin, teacher, other, pupil, peer, group, otherGroup, course, free, game] = Array.from(
      { length: 10 },
      randomUUID,
    );
    for (const [id, role] of [
      [admin, "admin"],
      [teacher, "teacher"],
      [other, "teacher"],
      [pupil, "student"],
      [peer, "student"],
    ]) {
      await db.query("insert into auth.users values($1)", [id]);
      await db.query("insert into profiles values($1,$2,'Joueur test')", [id, role]);
    }
    await db.query("insert into classes values($1,$2,'Classe A'),($3,$4,'Classe B')", [
      group,
      teacher,
      otherGroup,
      other,
    ]);
    await db.query(
      "insert into class_members values($1,$2,now()-interval '2 days'),($3,$4,now()-interval '2 days')",
      [group, pupil, otherGroup, peer],
    );
    await db.query("insert into courses values($1,1),($2,2)", [course, free]);
    await db.query(
      "insert into user_course_progress values(gen_random_uuid(),$1,$2,'completed',8000000,now()-interval '10 days',now())",
      [pupil, course],
    );
    await db.query("insert into games values($1,'flash-translation')", [game]);
    await db.query(
      "insert into game_scores select gen_random_uuid(),$1,$2,n*1000,'easy',now() - n*interval '1 minute' from generate_series(1,23) n",
      [pupil, game],
    );
    await db.query(
      "insert into game_scores values(gen_random_uuid(),$1,$2,666,'hard',now()-interval '5 days')",
      [pupil, game],
    );
    await db.query('insert into adventure_checkpoints values($1,1,2,now(),\'{"text":"private draft"}\')', [
      pupil,
    ]);
    const record = async (attempt, score, total, id = 1) =>
      (
        await db.query("select record_learning_checkpoint($1,$2,$3,$4,$5) ok", [
          pupil,
          id,
          attempt,
          score,
          total,
        ])
      ).rows[0].ok;
    const report = async (who, user = pupil, cls = null, page = 1, kind = "tout") =>
      (await db.query("select learner_activity_report($1,$2,$3,$4,$5) report", [who, user, cls, page, kind]))
        .rows[0].report;
    const first = randomUUID();
    await record(null, null, null);
    await record(first, 4, 10);
    await record(first, 4, 10);
    await assert.rejects(record(first, 5, 10), /does not match/);
    assert.equal((await report(admin)).courses[0].legacy, 20010004);
    await record(randomUUID(), 9, 10);
    await record(randomUUID(), 6, 10);
    assert.equal(await record(randomUUID(), 0, 10, 2), false);
    const all = await report(admin);
    assert.equal(all.courses[0].legacy, 10010009);
    assert.deepEqual([all.courses[0].tries, all.courses[0].best, all.courses[0].score], [3, 9, 6]);
    await Promise.all([record(randomUUID(), 10, 10), record(null, null, null), record(randomUUID(), 8, 10)]);
    assert.equal((await report(admin)).courses[0].legacy, 10010010);
    assert.equal(all.courses[1].score, 0);
    assert.equal(all.historyCount, 28);
    assert.equal(all.history.length, 20);
    assert.equal((await report(pupil, pupil, null, 2)).history.length, 10);
    assert.equal((await report(pupil, pupil, null, 1, "quiz")).historyCount, 6);
    assert.deepEqual((await report(pupil)).games, all.games);
    assert.ok(!JSON.stringify(all).includes("private draft"));
    const own = await report(teacher, pupil, group);
    assert.equal(own.historyCount, 29);
    assert.equal(own.games.length, 1);
    assert.equal(own.games[0].low, 1000);
    assert.equal(own.courses[0].legacy, null);
    assert.equal(await report(other, pupil, group), null);
    assert.equal(await report(teacher, pupil, otherGroup), null);
    assert.equal(await report(teacher, pupil), null);
    assert.equal(await report(peer, pupil), null);
    assert.equal(await report(null, pupil), null);
    await db.query("delete from class_members where user_id=$1", [pupil]);
    assert.equal(await report(teacher, pupil, group), null);
    assert.equal((await report(admin)).historyCount, 30);
    for (const role of ["anon", "authenticated"]) {
      const access = (
        await db.query(
          "select has_table_privilege($1,'learner_quizzes','select') or has_function_privilege($1,'learner_activity_report(uuid,uuid,uuid,integer,text)','execute') as allowed",
          [role],
        )
      ).rows[0];
      assert.equal(access.allowed, false);
    }
    await db.query("delete from auth.users where id=$1", [pupil]);
    assert.equal((await db.query("select count(*)::int as n from learner_quizzes")).rows[0].n, 0);
    assert.equal((await db.query("select count(*)::int as n from learner_readings")).rows[0].n, 0);
    console.log(
      "PASS Learner history: real grades, retries, free practice, placement, personal records, paging, private class scope and account deletion",
    );
  } finally {
    await db.close();
  }
}
run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

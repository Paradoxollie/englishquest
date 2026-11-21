const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { PGlite } = require("@electric-sql/pglite");

const migrations = path.join(__dirname, "../../supabase/migrations");
const readMigration = (name) => fs.readFileSync(path.join(migrations, name), "utf8");

async function run() {
  const db = new PGlite();
  const [firstTeacher, secondTeacher, pupil, admin, firstClass, secondClass] = Array.from({ length: 6 }, () => randomUUID());
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role;
      create schema auth;
      grant usage on schema auth to authenticated;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        $$select current_setting('fixture.viewer', true)::uuid$$;
      create table public.profiles (id uuid primary key references auth.users, role text not null);
      create table public.user_course_progress (user_id uuid references auth.users);
      create function public.is_admin_user() returns boolean language sql stable security definer
        set search_path = '' as $$select exists (
          select 1 from public.profiles where id = auth.uid() and role = 'admin'
        )$$;
    `);
    await db.exec(readMigration("2026-10-16_30_classes.sql"));
    const restriction = readMigration("20261121161616_restrict_teacher_class_membership.sql");
    // La deuxième enseignante avait rejoint la première classe en tant qu'élève.
    await db.exec(`
      insert into auth.users values ('${firstTeacher}'), ('${secondTeacher}'), ('${pupil}'), ('${admin}');
      insert into public.profiles values
        ('${firstTeacher}', 'teacher'), ('${secondTeacher}', 'student'), ('${pupil}', 'student'), ('${admin}', 'admin');
      insert into public.classes (id, teacher_id, name, code) values ('${firstClass}', '${firstTeacher}', 'A', 'AAAA22');
      insert into public.class_members (class_id, user_id) values ('${firstClass}', '${secondTeacher}');
      update public.profiles set role = 'teacher' where id = '${secondTeacher}';
      insert into public.classes (id, teacher_id, name, code) values ('${secondClass}', '${secondTeacher}', 'B', 'BBBB22');
      insert into public.class_members (class_id, user_id) values ('${secondClass}', '${pupil}');
      insert into public.class_assignments (class_id, course_id) values ('${firstClass}', 1), ('${secondClass}', 2);
    `);
    await db.exec(restriction);
    await db.exec("set role authenticated");

    async function visibleClasses(viewer) {
      await db.query("select set_config('fixture.viewer', $1, false)", [viewer]);
      return (await db.query(`
        select array(select code from public.classes order by code) as codes,
          array(select distinct class_id from public.class_members order by class_id) as member_lists,
          array(select course_id from public.class_assignments order by course_id) as assignments
      `)).rows[0];
    }
    const secondClassOnly = { codes: ["BBBB22"], member_lists: [secondClass], assignments: [2] };
    assert.deepEqual(await visibleClasses(secondTeacher), secondClassOnly);
    assert.deepEqual(await visibleClasses(firstTeacher), { codes: ["AAAA22"], member_lists: [firstClass], assignments: [1] });
    assert.deepEqual(await visibleClasses(pupil), secondClassOnly);
    assert.deepEqual(await visibleClasses(admin), {
      codes: ["AAAA22", "BBBB22"], member_lists: [firstClass, secondClass].sort(), assignments: [1, 2],
    });
    console.log("PASS PostgreSQL class, code, membership and assignment visibility for teachers, pupils and administrators");
  } finally {
    await db.close();
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });

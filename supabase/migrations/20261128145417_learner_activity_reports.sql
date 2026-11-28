-- One reading checkpoint per course. A quiz attempt stores its server grade only.
create table public.learner_readings (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_number smallint not null check (course_number between 1 and 50),
  reached_at timestamptz not null default now(),
  primary key (user_id, course_number)
);
create table public.learner_quizzes (
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id uuid not null,
  course_number smallint not null check (course_number between 1 and 50),
  score smallint not null,
  total smallint not null check (total between 1 and 999 and score between 0 and total),
  for_mission boolean not null,
  graded_at timestamptz not null default now(),
  primary key (user_id, attempt_id)
);
create index learner_quizzes_timeline on public.learner_quizzes(user_id, graded_at desc, attempt_id desc);
create index if not exists game_scores_learner_timeline on public.game_scores(user_id, created_at desc, id desc);
alter table public.learner_readings enable row level security;
alter table public.learner_quizzes enable row level security;
revoke all on public.learner_readings, public.learner_quizzes from public, anon, authenticated;
grant select, insert, update on public.learner_readings to service_role;
grant select, insert on public.learner_quizzes to service_role;

-- The original best grade, the new history and the retry receipt commit together.
create function public.record_learning_checkpoint(p_user uuid, p_course integer, p_attempt uuid, p_score integer, p_total integer)
returns boolean language plpgsql security invoker set search_path='' as $$
declare
  progress public.user_course_progress%rowtype;
  prior public.learner_quizzes%rowtype;
  eligible boolean;
  encoded integer;
  best integer := 0;
  denominator integer := 0;
begin
  if p_course is null or p_course not between 1 and 50 or not exists(select 1 from public.courses where course_number=p_course)
     or (p_attempt is null and (p_score is not null or p_total is not null))
     or (p_attempt is not null and (p_total is null or p_score is null or p_total not between 1 and 999 or p_score not between 0 and p_total)) then
    raise exception 'Invalid course checkpoint';
  end if;
  select p.* into progress from public.user_course_progress p join public.courses c on c.id=p.course_id
    where p.user_id=p_user and c.course_number=p_course for update of p;
  eligible := coalesce(progress.status in ('unlocked','in_progress','completed'), false);
  if p_attempt is not null then
    insert into public.learner_quizzes(user_id,attempt_id,course_number,score,total,for_mission)
    values(p_user,p_attempt,p_course,p_score,p_total,eligible) on conflict do nothing;
    if not found then
      select * into strict prior from public.learner_quizzes where user_id=p_user and attempt_id=p_attempt;
      if (prior.course_number,prior.score,prior.total) is distinct from (p_course,p_score,p_total) then
        raise exception 'Quiz receipt does not match';
      end if;
      return prior.for_mission;
    end if;
  end if;
  insert into public.learner_readings as r(user_id,course_number) values(p_user,p_course)
    on conflict (user_id,course_number) do update set reached_at=excluded.reached_at
    where (r.reached_at at time zone 'Europe/Paris')::date < (excluded.reached_at at time zone 'Europe/Paris')::date
      or exists (select 1 from public.class_members m where m.user_id=p_user and m.joined_at>r.reached_at and m.joined_at<=excluded.reached_at);
  if not eligible then return false; end if;

  -- Same encoding as lib/courses/mission-telemetry.ts, including placement.
  if progress.best_score >= 9000000 then
    denominator := ((progress.best_score - 9000000) % 1000000) / 1000;
    best := progress.best_score % 1000;
  end if;
  if p_attempt is not null and (denominator=0 or p_score*denominator > best*p_total
      or (p_score*denominator = best*p_total and p_score>best)) then
    best := p_score;
    denominator := p_total;
  end if;
  encoded := 10000000 + denominator*1000 + best;
  if (progress.best_score=8000000 or progress.best_score>=19000000) and (denominator=0 or best*5<denominator*4) then
    encoded := encoded + 10000000;
  end if;
  if progress.best_score is distinct from encoded then
    update public.user_course_progress set best_score=encoded, updated_at=now(),
      completed_at=case when progress.status='completed' and (progress.best_score=8000000 or progress.best_score>=19000000)
        and denominator>0 and best*5>=denominator*4 then now() else progress.completed_at end
      where id=progress.id;
  end if;
  return true;
end;
$$;
revoke all on function public.record_learning_checkpoint(uuid,integer,uuid,integer,integer) from public,anon,authenticated;
grant execute on function public.record_learning_checkpoint(uuid,integer,uuid,integer,integer) to service_role;

-- One database snapshot covers authorisation, the class membership window and the report.
create function public.learner_activity_report(p_viewer uuid, p_learner uuid, p_class uuid, p_page integer, p_kind text)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare
  actor text;
  pupil text;
  class_name text;
  joined timestamptz;
begin
  select role into actor from public.profiles where id=p_viewer;
  if actor is null then return null; end if;
  if p_class is not null then
    select m.joined_at,c.name into joined,class_name from public.class_members m join public.classes c on c.id=m.class_id
      where m.user_id=p_learner and c.id=p_class and (actor='admin' or (actor='teacher' and c.teacher_id=p_viewer));
    if not found then return null; end if;
  elsif p_learner is distinct from p_viewer and actor <> 'admin' then return null;
  end if;
  select username into pupil from public.profiles where id=p_learner;
  if not found then return null; end if;
  if p_page is null or p_page < 1 or p_kind is null or p_kind not in ('tout','jeux','quiz') then raise exception 'Invalid history page'; end if;

  return (
    with scores as (
      select s.id,s.score,s.difficulty,s.created_at,g.slug
      from public.game_scores s join public.games g on g.id=s.game_id
      where s.user_id=p_learner and s.created_at>=coalesce(joined,'-infinity')
    ), attempts as (
      select q.attempt_id,q.course_number,q.score,q.total,q.graded_at
      from public.learner_quizzes q where q.user_id=p_learner and q.graded_at>=coalesce(joined,'-infinity')
    ), game_groups as (
      select slug,difficulty,count(*) as plays,min(score) as low,max(score) as high,max(created_at) as latest
      from scores group by slug,difficulty
    ), quiz_groups as (
      select distinct on (course_number) course_number,score,total,
        count(*) over(partition by course_number) as tries,
        first_value(score) over best as best, first_value(total) over best as best_total,
        graded_at as latest
      from attempts
      window best as (partition by course_number order by score::numeric/total desc,graded_at desc,attempt_id desc)
      order by course_number,graded_at desc,attempt_id desc
    ), course_rows as (
      select c.course_number as course,
        case when joined is null then p.best_score end as legacy,
        case when joined is null then p.status
             when p.completed_at>=joined and coalesce(p.best_score,0)<>8000000 and coalesce(p.best_score,0)<19000000 then 'completed' end as status,
        case when joined is null or p.completed_at>=joined then p.completed_at end as finished,
        r.reached_at as reading, q.score,q.total,q.tries,q.best,q.best_total,q.latest
      from public.courses c
      left join public.user_course_progress p on p.course_id=c.id and p.user_id=p_learner
      left join public.learner_readings r on r.course_number=c.course_number and r.user_id=p_learner and r.reached_at>=coalesce(joined,'-infinity')
      left join quiz_groups q on q.course_number=c.course_number
      where q.course_number is not null or r.course_number is not null
        or (joined is null and (p.status in ('in_progress','completed') or p.best_score>=9000000))
        or (p.completed_at>=joined and p.status='completed' and coalesce(p.best_score,0)<>8000000 and coalesce(p.best_score,0)<19000000)
    ), history as (
      select id,'jeu'::text as kind,created_at as happened,slug,difficulty,null::integer as course,score,null::integer as total
        from scores where p_kind in ('tout','jeux')
      union all
      select attempt_id,'quiz',graded_at,null,null,course_number,score,total
        from attempts where p_kind in ('tout','quiz')
    ), history_page as (
      select * from history order by happened desc,kind,id desc limit 20 offset ((p_page::bigint-1)*20)
    )
    select jsonb_build_object(
      'username',pupil,'className',class_name,'since',joined,
      'games',coalesce((select jsonb_agg(to_jsonb(g) order by latest desc,slug,difficulty) from game_groups g),'[]'::jsonb),
      'courses',coalesce((select jsonb_agg(to_jsonb(c) order by course) from course_rows c),'[]'::jsonb),
      'atlas',coalesce((select jsonb_agg(jsonb_build_object('mission',a.mission,'stage',a.stage,'updated',a.updated_at) order by a.mission)
        from public.adventure_checkpoints a where a.user_id=p_learner and a.stage>0 and a.updated_at>=coalesce(joined,'-infinity')),'[]'::jsonb),
      'historyCount',(select count(*) from history),
      'history',coalesce((select jsonb_agg(to_jsonb(h)-'id' order by happened desc,kind,id desc) from history_page h),'[]'::jsonb)
    )
  );
end;
$$;
revoke all on function public.learner_activity_report(uuid,uuid,uuid,integer,text) from public,anon,authenticated;
grant execute on function public.learner_activity_report(uuid,uuid,uuid,integer,text) to service_role;

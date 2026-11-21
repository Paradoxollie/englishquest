create table public.class_live_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes on delete cascade,
  rounds jsonb not null check (jsonb_typeof(rounds) = 'array' and jsonb_array_length(rounds) between 1 and 12),
  created_at timestamptz not null default clock_timestamp(),
  starts_at timestamptz,
  ends_at timestamptz,
  stopped_at timestamptz,
  unique(id,class_id)
);
create index class_live_sessions_class_date on public.class_live_sessions(class_id, created_at desc);

create table public.class_live_people (
  session_id uuid not null,
  class_id uuid not null,
  user_id uuid not null references public.profiles on delete cascade,
  joined_at timestamptz not null default clock_timestamp(),
  last_seen_at timestamptz not null default clock_timestamp(),
  primary key(session_id, user_id),
  foreign key(session_id,class_id) references public.class_live_sessions(id,class_id) on delete cascade,
  foreign key(class_id,user_id) references public.class_members(class_id,user_id) on delete cascade
);
create index class_live_people_user on public.class_live_people(user_id);
create index class_live_people_membership on public.class_live_people(class_id,user_id);

create table public.class_live_results (
  session_id uuid not null,
  user_id uuid not null,
  round_index smallint not null check (round_index between 0 and 11),
  answered integer not null check (answered >= 0),
  correct integer not null check (correct between 0 and answered),
  marks jsonb not null default '[]'::jsonb,
  primary key(session_id, user_id, round_index),
  foreign key(session_id, user_id) references public.class_live_people on delete cascade
);
create index class_live_results_best on public.class_live_results(session_id, round_index, correct desc);

alter table public.class_live_sessions enable row level security;
alter table public.class_live_people enable row level security;
alter table public.class_live_results enable row level security;
revoke all on public.class_live_sessions, public.class_live_people, public.class_live_results from public, anon, authenticated;
grant select, insert, update, delete on public.class_live_sessions, public.class_live_people, public.class_live_results to service_role;

-- Le serveur authentifié corrige les exercices. La première réponse à chaque exercice fait foi.
-- Les relevés des jeux sont cumulatifs et bornés par le temps effectivement disponible.
create function public.class_live_record(p_room uuid, p_user uuid, p_index integer, p_round jsonb, p_data jsonb, p_elapsed numeric)
returns void language plpgsql set search_path = '' as $$
declare
  v_old public.class_live_results%rowtype;
  v_marks jsonb := '[]';
  v_mark jsonb;
  v_answered integer;
  v_correct integer;
  v_limit integer := greatest(0, floor(p_elapsed * 4)::integer + 3);
begin
  if p_data is null or jsonb_typeof(p_data) <> 'object' or p_elapsed < 0 then return; end if;
  -- Deux onglets d'un même élève doivent conserver la même première réponse.
  perform 1 from public.class_live_people where session_id = p_room and user_id = p_user for update;
  if not found then return; end if;
  select * into v_old from public.class_live_results where session_id=p_room and user_id=p_user and round_index=p_index;
  if p_round->>'kind' = 'course' then
    if p_data->>'courseId' is distinct from p_round->>'courseId' or jsonb_typeof(p_data->'marks') is distinct from 'array' then return; end if;
    v_marks := coalesce(v_old.marks, '[]');
    for v_mark in select value from jsonb_array_elements(p_data->'marks') loop
      if jsonb_array_length(v_marks) >= least(v_limit, 40) then exit; end if;
      if not exists (select from jsonb_array_elements(v_marks) o where o->>'id' = v_mark->>'id') then
        v_marks := v_marks || jsonb_build_array(v_mark);
      end if;
    end loop;
    v_answered := jsonb_array_length(v_marks);
    select count(*)::integer into v_correct from jsonb_array_elements(v_marks) m where m->>'ok' = 'true';
  else
    if not (p_data ? 'answered' and p_data ? 'correct') then return; end if;
    v_answered := greatest(coalesce(v_old.answered,0), least(v_limit, (p_data->>'answered')::integer));
    v_correct := greatest(coalesce(v_old.correct,0), least(v_answered, (p_data->>'correct')::integer));
  end if;
  if v_answered <= 0 or (v_answered=v_old.answered and v_correct=v_old.correct and v_marks=v_old.marks) then return; end if;
  insert into public.class_live_results as result(session_id,user_id,round_index,answered,correct,marks)
    values(p_room,p_user,p_index,v_answered,v_correct,v_marks)
    on conflict(session_id,user_id,round_index) do update
    set answered=excluded.answered, correct=excluded.correct, marks=excluded.marks;
end;
$$;

-- Une manche vaut jusqu'à cent points, même quand deux jeux n'ont pas le même rythme.
create function public.class_live_board(p_room uuid, p_user uuid, p_staff boolean, p_final boolean, p_index integer)
returns jsonb language sql stable set search_path = '' as $$
  with visible as materialized (
    select lp.user_id, p.username, lp.last_seen_at
    from public.class_live_people lp join public.profiles p on p.id = lp.user_id
    where lp.session_id=p_room and (p_staff or p_final or lp.user_id=p_user)
  ), details as materialized (
    select r.user_id, r.round_index, r.answered, r.correct,
      coalesce(round(100.0*r.correct/nullif((
        select best.correct from public.class_live_results best
        where best.session_id=p_room and best.round_index=r.round_index order by best.correct desc limit 1
      ),0))::integer,0) as points
    from public.class_live_results r join visible v on v.user_id=r.user_id
    where r.session_id=p_room
  ), totals as (
    select v.user_id, v.username, v.last_seen_at, coalesce(sum(d.points),0) as points, count(d.round_index) as played
    from visible v left join details d on v.user_id=d.user_id group by v.user_id, v.username, v.last_seen_at
  ), ranked as (
    select t.*, case when points>0 and (p_staff or p_final) then rank() over (order by points desc) end as place from totals t
  ), entries as (
    select t.user_id,t.place,t.username,
      jsonb_build_object('name', t.username,'rank',t.place,'points',t.points,'roundsPlayed',t.played,
        'lastSeenAt',floor(extract(epoch from t.last_seen_at)*1000)::bigint,
        'roundIndex',coalesce(current_result.round_index, nullif(p_index,-1)),
        'score',100*coalesce(current_result.correct,0),'answered',coalesce(current_result.answered,0),'correct',coalesce(current_result.correct,0)
      ) as entry,
      case when t.user_id=p_user and current_result.marks is not null then
        (select coalesce(jsonb_agg(mark-'ok'),'[]') from jsonb_array_elements(current_result.marks) mark) end as own_answers,
      case when p_final and (p_staff or t.user_id=p_user) then (select coalesce(jsonb_agg(jsonb_build_object('index',d.round_index,
        'answered',d.answered,'correct',d.correct,'score',100*d.correct,'points',d.points) order by d.round_index),'[]')
        from details d where d.user_id=t.user_id) end as round_details
    from ranked t left join lateral (
      select r.round_index,r.answered,r.correct,r.marks from public.class_live_results r
      where r.session_id=p_room and r.user_id=t.user_id and (r.round_index=p_index or p_final)
      order by r.round_index desc limit 1
    ) current_result on true
  )
  select jsonb_build_object(
    'people',coalesce((select jsonb_agg(entry || case when not p_staff then '{"lastSeenAt":0,"roundIndex":null}'::jsonb
      when round_details is null then '{}'::jsonb else jsonb_build_object('results',round_details) end
      order by place nulls last, username, user_id) from entries where p_staff or (p_final and place<=3)),'[]'),
    'self',(select entry || case when own_answers is null then '{}'::jsonb else jsonb_build_object('answers',own_answers) end
      || case when round_details is null then '{}'::jsonb else jsonb_build_object('results',round_details) end from entries where user_id=p_user)
  );
$$;

-- Seul le serveur du site appelle ces fonctions, après vérification du compte connecté.
create function public.class_live_request(p_user uuid, p_class uuid, p_action text, p_session uuid default null,
  p_rounds jsonb default null, p_index integer default null, p_progress jsonb default null)
returns jsonb language plpgsql set search_path = '' as $$
declare
  v_now timestamptz;
  v_class public.classes%rowtype;
  v_role text;
  v_staff boolean;
  v_room public.class_live_sessions%rowtype;
  v_final boolean;
  v_joined timestamptz;
  v_duration integer;
  v_round jsonb;
  v_start timestamptz;
  v_end timestamptz;
  v_index integer := -1;
  v_seen integer := 0;
  v_board jsonb := '{"people":[],"self":null}';
  v_history jsonb := '[]';
  v_payload jsonb := 'null';
begin
  select role into v_role from public.profiles where id=p_user;
  if v_role is null then raise exception 'live_unavailable' using errcode='P0002'; end if;
  if p_action not in ('state','prepare','start','stop','pulse') then raise exception 'live_invalid'; end if;
  -- Les décisions de l'enseignant sont sérialisées par classe. Les téléphones ne prennent pas ce verrou.
  if p_action in ('prepare','start','stop') then
    select * into v_class from public.classes where id=p_class and (teacher_id=p_user or v_role='admin') for update;
  else
    select * into v_class from public.classes where id=p_class;
  end if;
  v_staff := v_role='admin' or (v_role='teacher' and v_class.teacher_id=p_user);
  if v_class.id is null or not (v_staff or (v_role='student' and v_class.archived_at is null and exists (
    select from public.class_members where class_id=p_class and user_id=p_user
  ))) then raise exception 'live_unavailable' using errcode='P0002'; end if;
  if p_action in ('prepare','start','stop') and not v_staff then raise exception 'live_unavailable' using errcode='P0002'; end if;
  if p_action in ('prepare','start') and v_class.archived_at is not null then raise exception 'live_archived'; end if;
  if p_action='pulse' and v_staff then raise exception 'live_unavailable' using errcode='P0002'; end if;
  v_now := clock_timestamp();
  if p_session is not null then
    select * into v_room from public.class_live_sessions where id=p_session and class_id=p_class;
    if not found then raise exception 'live_unavailable' using errcode='P0002'; end if;
  else
    select * into v_room from public.class_live_sessions where class_id=p_class order by created_at desc,id desc limit 1;
  end if;

  if p_action='prepare' then
    if jsonb_typeof(p_rounds) is distinct from 'array' or jsonb_array_length(p_rounds) not between 1 and 12 then raise exception 'live_invalid'; end if;
    select sum((r->>'durationSeconds')::integer) into v_duration from jsonb_array_elements(p_rounds) r;
    if v_duration not between 30 and 10800 or exists(select from jsonb_array_elements(p_rounds) r
      where coalesce((r->>'durationSeconds')::integer,0) not between 30 and 1800 or coalesce(r->>'kind','') not in ('game','course')) then
      raise exception 'live_invalid';
    end if;
    if v_room.id is not null and v_room.stopped_at is null and (v_room.ends_at is null or v_now<v_room.ends_at) then
      if v_room.starts_at is not null or v_room.rounds<>p_rounds then raise exception 'live_in_progress'; end if;
    else
      insert into public.class_live_sessions(class_id,rounds,created_at) values(p_class,p_rounds,v_now) returning * into v_room;
    end if;
  elsif p_action='start' then
    if p_session is null or v_room.stopped_at is not null then raise exception 'live_closed'; end if;
    if v_room.starts_at is null then
      select sum((r->>'durationSeconds')::integer) into v_duration from jsonb_array_elements(v_room.rounds) r;
      v_start := v_now + interval '12 seconds';
      update public.class_live_sessions set starts_at=v_start, ends_at=v_start+make_interval(secs=>v_duration)
        where id=v_room.id returning * into v_room;
    end if;
  elsif p_action='stop' then
    if p_session is null then raise exception 'live_invalid'; end if;
    if v_room.stopped_at is null and (v_room.ends_at is null or v_room.ends_at>v_now) then
      update public.class_live_sessions set stopped_at=v_now where id=v_room.id returning * into v_room;
    end if;
  end if;

  if v_staff then
    select coalesce(jsonb_agg(jsonb_build_object('id',h.id,'createdAt',floor(extract(epoch from h.created_at)*1000)::bigint,
      'startsAt',floor(extract(epoch from h.starts_at)*1000)::bigint,'roundCount',jsonb_array_length(h.rounds)) order by h.created_at desc),'[]') into v_history
    from (select id,created_at,starts_at,rounds from public.class_live_sessions where class_id=p_class and starts_at is not null and
      (ends_at<=v_now or stopped_at is not null) order by created_at desc limit 30) h;
  end if;
  if v_room.id is not null then
    v_final := v_room.stopped_at is not null or coalesce(v_now>=v_room.ends_at,false);
    if not v_staff then
      if p_action='pulse' and p_session=v_room.id and not v_final then
        insert into public.class_live_people as lp(session_id,class_id,user_id,joined_at,last_seen_at) values(v_room.id,p_class,p_user,v_now,v_now)
          on conflict(session_id,user_id) do update set last_seen_at=excluded.last_seen_at
          where lp.last_seen_at < excluded.last_seen_at - interval '10 seconds';
      end if;
      select joined_at into v_joined from public.class_live_people where session_id=v_room.id and user_id=p_user;
    end if;
    if v_staff or not v_final or v_joined is not null then
      v_start := v_room.starts_at;
      for v_round in select value from jsonb_array_elements(v_room.rounds) loop
        if v_start is null then exit; end if;
        v_end := v_start+make_interval(secs=>(v_round->>'durationSeconds')::integer);
        if not v_final and v_now>=v_start and v_now<v_end then v_index := v_seen; end if;
        if p_action='pulse' and v_seen=p_index and v_joined is not null and p_progress is not null then
          v_end := least(v_end,coalesce(v_room.stopped_at,v_end));
          if v_now>=v_start and v_end>=greatest(v_start,v_joined) and v_now <= v_end+interval '8 seconds' then
            perform public.class_live_record(v_room.id,p_user,v_seen,v_round,p_progress,
              extract(epoch from least(v_now,v_end)-greatest(v_joined,v_start)));
          end if;
          -- Le calendrier des manches suivantes reste celui que la classe a reçu au départ.
          v_end := v_start+make_interval(secs=>(v_round->>'durationSeconds')::integer);
        end if;
        v_seen := v_seen+1;
        v_start := v_end;
      end loop;
      v_payload := jsonb_build_object('id',v_room.id,'rounds',v_room.rounds,
        'createdAt',floor(extract(epoch from v_room.created_at)*1000)::bigint,'startsAt',floor(extract(epoch from v_room.starts_at)*1000)::bigint,
        'endsAt',floor(extract(epoch from v_room.ends_at)*1000)::bigint,'stoppedAt',floor(extract(epoch from v_room.stopped_at)*1000)::bigint);
      v_board := public.class_live_board(v_room.id,p_user,v_staff,v_final,v_index);
    end if;
  end if;
  return v_board || jsonb_build_object('serverNow',floor(extract(epoch from v_now)*1000)::bigint,'classId',p_class,'className',v_class.name,
    'code',case when v_staff then v_class.code end,'teacher',v_staff,'session',v_payload,'history',v_history);
end;
$$;
revoke all on function public.class_live_request(uuid,uuid,text,uuid,jsonb,integer,jsonb),
  public.class_live_board(uuid,uuid,boolean,boolean,integer), public.class_live_record(uuid,uuid,integer,jsonb,jsonb,numeric) from public,anon,authenticated;
grant execute on function public.class_live_request(uuid,uuid,text,uuid,jsonb,integer,jsonb),
  public.class_live_board(uuid,uuid,boolean,boolean,integer), public.class_live_record(uuid,uuid,integer,jsonb,jsonb,numeric) to service_role;

-- Les compteurs d'entraînement individuel commencent à l'inscription dans cette classe.
create function public.class_practice_week(p_user uuid, p_class uuid)
returns table(pupil text, games bigint, missions bigint) language sql stable set search_path = '' as $$
  select p.username::text,
    (select count(*) from public.game_scores g where g.user_id=m.user_id and g.created_at>=greatest(m.joined_at,now()-interval '7 days')),
    (select count(*) from public.user_course_progress cp where cp.user_id=m.user_id and cp.status='completed'
      and cp.completed_at>=greatest(m.joined_at,now()-interval '7 days'))
  from public.classes c join public.profiles viewer on viewer.id=p_user
    join public.class_members m on m.class_id=c.id join public.profiles p on p.id=m.user_id
  where c.id=p_class and (viewer.role='admin' or (viewer.role='teacher' and c.teacher_id=p_user))
  order by lower(p.username),p.id
$$;
revoke all on function public.class_practice_week(uuid,uuid) from public,anon,authenticated;
grant execute on function public.class_practice_week(uuid,uuid) to service_role;

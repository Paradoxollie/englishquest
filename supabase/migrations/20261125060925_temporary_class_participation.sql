-- Guests belong to one class. They have neither an Auth user nor a public profile.
alter table public.classes add column ask_first_name boolean not null default false;
create table public.class_guests (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 24),
  token_hash text unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  access_until timestamptz not null default now() + interval '4 hours',
  report_until timestamptz not null default now() + interval '10 days',
  unique (class_id, id)
);
create unique index class_guest_active_name on public.class_guests(class_id, lower(nickname)) where token_hash is not null;
create index class_guest_retention on public.class_guests(report_until);
create table public.class_guest_work (
  guest_id uuid not null references public.class_guests on delete cascade,
  assignment_id uuid not null references public.class_assignments on delete cascade,
  marks jsonb not null default '[]' check (jsonb_typeof(marks)='array'),
  primary key (guest_id, assignment_id)
);
create index class_guest_work_assignment on public.class_guest_work(assignment_id);
create table public.class_guest_join_limits (
  bucket text primary key check (bucket ~ '^[0-9a-f]{64}$'),
  failures integer not null,
  expires_at timestamptz not null
);
alter table public.class_guests enable row level security;
alter table public.class_guest_work enable row level security;
alter table public.class_guest_join_limits enable row level security;
revoke all on public.class_guests, public.class_guest_work, public.class_guest_join_limits from public, anon, authenticated;
grant select, insert, update, delete on public.class_guests, public.class_guest_work, public.class_guest_join_limits to service_role;

-- Keep the existing result key and the cascading membership check for every registered player.
alter table public.class_live_people
  add column guest_id uuid,
  add column member_id uuid generated always as (case when guest_id is null then user_id end) stored,
  drop constraint class_live_people_user_id_fkey,
  drop constraint class_live_people_class_id_user_id_fkey,
  add constraint class_live_guest_identity check (guest_id is null or guest_id=user_id),
  add foreign key (class_id, member_id) references public.class_members(class_id,user_id) on delete cascade,
  add foreign key (class_id, guest_id) references public.class_guests(class_id,id) on delete cascade;
create index class_live_people_guest on public.class_live_people(class_id,guest_id) where guest_id is not null;
create index class_live_people_member on public.class_live_people(class_id,member_id) where member_id is not null;

create function public.enter_class_as_guest(p_code text, p_name text, p_hash text, p_bucket text)
returns jsonb language plpgsql set search_path='' as $$
declare
  classroom uuid;
  guest public.class_guests%rowtype;
begin
  if p_code is null or p_code !~ '^[A-HJKMNP-Z2-9]{6}$' or p_hash is null or p_hash !~ '^[0-9a-f]{64}$'
     or p_bucket is null or p_bucket !~ '^[0-9a-f]{64}$' or p_name is null
     or char_length(p_name) not between 1 and 24 or p_name<>trim(p_name) then return '{"error":"invalid"}'; end if;
  if exists(select from public.class_guest_join_limits where bucket=p_bucket and failures>=40 and expires_at>now())
    then return '{"error":"limited"}'; end if;
  select id into classroom from public.classes where code=p_code and archived_at is null for update;
  if not found then
    insert into public.class_guest_join_limits as l values(p_bucket,1,now()+interval '1 hour')
      on conflict(bucket) do update set failures=case when l.expires_at>now() then least(40,l.failures+1) else 1 end,
      expires_at=case when l.expires_at>now() then l.expires_at else excluded.expires_at end;
    return '{"error":"invalid"}';
  end if;
  select * into guest from public.class_guests where token_hash=p_hash and class_id=classroom and access_until>now();
  if not found then
    update public.class_guests set token_hash=null where class_id=classroom and token_hash is not null and access_until<=now();
    if exists(select from public.class_guests where class_id=classroom and access_until>now() and lower(nickname)=lower(p_name))
      or exists(select from public.class_members m join public.profiles p on p.id=m.user_id
        where m.class_id=classroom and lower(p.username)=lower(p_name)) then return '{"error":"name"}'; end if;
    if (select count(*) from public.class_guests where class_id=classroom and access_until>now())>=100
      then return '{"error":"full"}'; end if;
    insert into public.class_guests(class_id,nickname,token_hash) values(classroom,p_name,p_hash) returning * into guest;
  end if;
  return jsonb_build_object('classId',classroom,'accessUntil',guest.access_until);
end; $$;
revoke all on function public.enter_class_as_guest(text,text,text,text) from public, anon, authenticated;
grant execute on function public.enter_class_as_guest(text,text,text,text) to service_role;

create function public.revoke_old_guest_invitation() returns trigger language plpgsql set search_path='' as $$
begin
  update public.class_guests set token_hash=null where class_id=new.id and token_hash is not null;
  return new;
end; $$;
revoke all on function public.revoke_old_guest_invitation() from public,anon,authenticated;
create trigger class_guests_invitation_changed after update of code,archived_at on public.classes
for each row when (old.code is distinct from new.code or new.archived_at is distinct from old.archived_at)
execute function public.revoke_old_guest_invitation();

-- Only first, server-graded answers count. Free text stays in the pupil's browser.
create function public.save_guest_class_work(p_hash text,p_assignment uuid,p_course integer,p_marks jsonb)
returns boolean language plpgsql set search_path='' as $$
declare
  guest uuid;
  saved jsonb;
  mark jsonb;
begin
  select g.id into guest from public.class_guests g join public.classes c on c.id=g.class_id
    join public.class_assignments a on a.class_id=c.id
    where g.token_hash=p_hash and g.access_until>now() and c.archived_at is null
    and a.id=p_assignment and a.course_id=p_course for update of g;
  if not found or jsonb_typeof(p_marks) is distinct from 'array' or jsonb_array_length(p_marks) not between 1 and 40 then return false; end if;
  insert into public.class_guest_work(guest_id,assignment_id) values(guest,p_assignment) on conflict do nothing;
  select marks into saved from public.class_guest_work where guest_id=guest and assignment_id=p_assignment for update;
  for mark in select value from jsonb_array_elements(p_marks) loop
    if jsonb_array_length(saved)>=40 then exit; end if;
    if jsonb_typeof(mark->'ok')='boolean' and length(mark->>'id') between 1 and 80
      and not exists(select from jsonb_array_elements(saved) s where s->>'id'=mark->>'id') then
      saved:=saved || jsonb_build_array(jsonb_build_object('id',mark->>'id','ok',mark->'ok'));
    end if;
  end loop;
  update public.class_guest_work set marks=saved where guest_id=guest and assignment_id=p_assignment and marks<>saved;
  return true;
end; $$;
revoke all on function public.save_guest_class_work(text,uuid,integer,jsonb) from public,anon,authenticated;
grant execute on function public.save_guest_class_work(text,uuid,integer,jsonb) to service_role;

create or replace function public.class_live_board(p_room uuid, p_user uuid, p_staff boolean, p_final boolean, p_index integer)
returns jsonb language sql stable set search_path = '' as $$
  with visible as materialized (
    select lp.user_id, coalesce(p.username,g.nickname) as username, lp.last_seen_at
    from public.class_live_people lp left join public.profiles p on p.id=lp.member_id
    left join public.class_guests g on g.id=lp.guest_id
    where lp.session_id=p_room and (lp.guest_id is null or g.report_until>now()) and (p_staff or p_final or lp.user_id=p_user)
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

create function public.class_participant_request(p_user uuid, p_class uuid, p_action text, p_session uuid default null,
  p_rounds jsonb default null, p_index integer default null, p_progress jsonb default null, p_guest_hash text default null)
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
  if p_guest_hash is not null then
    if p_user is not null or p_action not in ('state','pulse') then raise exception 'live_unavailable' using errcode='P0002'; end if;
    select id,'guest' into p_user,v_role from public.class_guests where token_hash=p_guest_hash and class_id=p_class and access_until>now();
  else
    select role into v_role from public.profiles where id=p_user;
  end if;
  if v_role is null then raise exception 'live_unavailable' using errcode='P0002'; end if;
  if p_action not in ('state','prepare','start','stop','pulse') then raise exception 'live_invalid'; end if;
  -- Les décisions de l'enseignant sont sérialisées par classe. Les téléphones ne prennent pas ce verrou.
  if p_action in ('prepare','start','stop') then
    select * into v_class from public.classes where id=p_class and (teacher_id=p_user or v_role='admin') for update;
  else
    select * into v_class from public.classes where id=p_class;
  end if;
  v_staff := v_role='admin' or (v_role='teacher' and v_class.teacher_id=p_user);
  if v_class.id is null or not (v_staff or (v_role='guest' and v_class.archived_at is null) or (v_role='student' and v_class.archived_at is null and exists (
    select from public.class_members where class_id=p_class and user_id=p_user
  ))) then raise exception 'live_unavailable' using errcode='P0002'; end if;
  if p_action in ('prepare','start','stop') and not v_staff then raise exception 'live_unavailable' using errcode='P0002'; end if;
  if p_action in ('prepare','start') and v_class.archived_at is not null then raise exception 'live_archived'; end if;
  if p_action='pulse' and v_staff then raise exception 'live_unavailable' using errcode='P0002'; end if;
  v_now := clock_timestamp();
  if p_session is not null then
    select * into v_room from public.class_live_sessions where id=p_session and class_id=p_class
      and coalesce(stopped_at,ends_at,created_at)>v_now-interval '10 days';
    if not found then raise exception 'live_unavailable' using errcode='P0002'; end if;
  else
    select * into v_room from public.class_live_sessions where class_id=p_class
      and coalesce(stopped_at,ends_at,created_at)>v_now-interval '10 days' order by created_at desc,id desc limit 1;
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
    from (select id,created_at,starts_at,rounds from public.class_live_sessions where class_id=p_class and starts_at is not null
      and coalesce(stopped_at,ends_at,created_at)>v_now-interval '10 days' and
      (ends_at<=v_now or stopped_at is not null) order by created_at desc limit 30) h;
  end if;
  if v_room.id is not null then
    v_final := v_room.stopped_at is not null or coalesce(v_now>=v_room.ends_at,false);
    if not v_staff then
      if p_action='pulse' and p_session=v_room.id and not v_final then
        insert into public.class_live_people as lp(session_id,class_id,user_id,guest_id,joined_at,last_seen_at)
          values(v_room.id,p_class,p_user,case when v_role='guest' then p_user end,v_now,v_now)
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
            if v_role='guest' and jsonb_typeof(p_progress->'marks')='array' then
              p_progress:=jsonb_set(p_progress,'{marks}',(select coalesce(jsonb_agg(jsonb_build_object('id',m->'id','ok',m->'ok')),'[]'::jsonb)
                from jsonb_array_elements(p_progress->'marks') m));
            end if;
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
revoke all on function public.class_participant_request(uuid,uuid,text,uuid,jsonb,integer,jsonb,text) from public,anon,authenticated;
grant execute on function public.class_participant_request(uuid,uuid,text,uuid,jsonb,integer,jsonb,text) to service_role;

-- Keep the signed-in interface for existing clients during rollout.
create or replace function public.class_live_request(p_user uuid,p_class uuid,p_action text,p_session uuid default null,
  p_rounds jsonb default null,p_index integer default null,p_progress jsonb default null)
returns jsonb language sql set search_path='' as $$
  select public.class_participant_request(p_user,p_class,p_action,p_session,p_rounds,p_index,p_progress,null);
$$;

-- The game score, its XP/gold and the session receipt share one transaction.
-- The service role supplies only server-validated results and reward variants.
alter table public.game_sessions
  add column if not exists score_request jsonb,
  add column if not exists score_receipt jsonb;

-- Match WELCOME_GOLD when the Auth trigger creates a new profile.
alter table public.profiles alter column gold set default 30;

create index if not exists game_scores_game_score_idx on public.game_scores (game_id, score);
create index if not exists game_scores_user_game_created_idx on public.game_scores (user_id, game_id, created_at);

create or replace function public.finish_game_score(
  p_user_id uuid, p_session_id uuid, p_slug text, p_score integer, p_max_score integer,
  p_duration integer, p_difficulty text, p_record_eligible boolean, p_reward_options jsonb,
  p_full_plays integer, p_xp_level integer, p_context jsonb
) returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_session public.game_sessions%rowtype;
  v_game uuid;
  v_profile public.profiles%rowtype;
  v_now timestamptz := clock_timestamp();
  v_previous integer; v_global integer; v_plays integer;
  v_personal_record boolean; v_global_record boolean;
  v_lower boolean := p_slug = 'flash-translation';
  v_by_difficulty boolean := p_slug in ('enigma-scroll','wordfall','speed-verb-challenge','echo-signal','spell-strike');
  v_reward jsonb; v_request jsonb; v_receipt jsonb;
  v_xp integer; v_gold integer; v_level integer;
begin
  if p_user_id is null or p_session_id is null or p_duration is null or p_duration < 0
      or p_slug is null or p_record_eligible is null or p_difficulty is null
      or p_score is null or p_score < 0 or p_difficulty not in ('easy','medium','hard')
      or coalesce(p_xp_level,0) <= 0 or coalesce(p_full_plays,0) <= 0 then raise exception 'Invalid game result'; end if;
  select * into v_session from public.game_sessions where id = p_session_id for update;
  if not found or v_session.user_id <> p_user_id or v_session.game_slug <> p_slug then
    return jsonb_build_object('error','unknown');
  end if;
  v_request := jsonb_build_array(p_score, p_max_score, p_duration, p_difficulty, p_record_eligible, p_context);
  if v_session.used_at is not null then
    if v_session.score_request = v_request and v_session.score_receipt is not null then
      return v_session.score_receipt || '{"replayed":true}'::jsonb;
    end if;
    return jsonb_build_object('error','used');
  end if;
  if v_now - v_session.started_at > interval '2 hours' then return jsonb_build_object('error','expired'); end if;
  if extract(epoch from (v_now - v_session.started_at)) * 1000 + 3000 < p_duration then
    return jsonb_build_object('error','too_fast');
  end if;

  -- Serialize record awards for two simultaneous finishes of the same game.
  select id into v_game from public.games where slug = p_slug for update;
  if not found and p_slug = 'flashback' then
    select id into v_game from public.games where slug = 'echo-lex' for update;
  end if;
  if v_game is null then raise exception 'Game not found'; end if;
  select * into strict v_profile from public.profiles where id = p_user_id for update;

  if v_lower then
    select score into v_global from public.game_scores where game_id = v_game order by score limit 1;
    select score into v_previous from public.game_scores where game_id = v_game and user_id = p_user_id order by score limit 1;
  elsif v_by_difficulty then
    select score into v_global from public.game_scores where game_id = v_game and difficulty = p_difficulty order by score desc limit 1;
    select score into v_previous from public.game_scores where game_id = v_game and difficulty = p_difficulty and user_id = p_user_id order by score desc limit 1;
  else
    select score into v_global from public.game_scores where game_id = v_game order by score desc limit 1;
    select score into v_previous from public.game_scores where game_id = v_game and user_id = p_user_id order by score desc limit 1;
  end if;
  v_personal_record := p_record_eligible and (v_previous is null or case when v_lower then p_score < v_previous else p_score > v_previous end);
  v_global_record := p_record_eligible and (v_global is null or case when v_lower then p_score < v_global else p_score > v_global end);
  select count(*) into v_plays from public.game_scores where user_id = p_user_id and game_id = v_game
    and created_at >= (date_trunc('day', v_now at time zone 'Europe/Paris') at time zone 'Europe/Paris');
  v_reward := p_reward_options -> (case when v_plays >= p_full_plays then 'reduced' else 'full' end)
    -> (case when v_global_record then 'global' when v_personal_record then 'personal' else 'standard' end);
  if (v_reward->>'xpEarned')::integer is null or (v_reward->>'goldEarned')::integer is null
    or (v_reward->>'xpEarned')::integer < 0 or (v_reward->>'goldEarned')::integer < 0 then
    raise exception 'Invalid game reward';
  end if;
  v_xp := coalesce(v_profile.xp,0) + (v_reward->>'xpEarned')::integer;
  v_gold := coalesce(v_profile.gold,0) + (v_reward->>'goldEarned')::integer;
  v_level := 1 + greatest(v_xp,0) / p_xp_level;
  insert into public.game_scores (user_id,game_id,score,max_score,duration_ms,difficulty)
    values (p_user_id,v_game,p_score,p_max_score,p_duration,p_difficulty);
  update public.profiles set xp = v_xp, gold = v_gold, level = v_level, updated_at = v_now where id = p_user_id;
  v_receipt := jsonb_build_object('rewards',v_reward, 'playsToday',v_plays,
    'previousBest', v_previous, 'isNewPersonalBest', v_personal_record, 'isNewGlobalBest', v_global_record,
    'level',v_level, 'previousLevel',coalesce(v_profile.level,1), 'savedAt',v_now,'replayed',false);
  update public.game_sessions set used_at = v_now, score_request = v_request, score_receipt = v_receipt where id = p_session_id;
  return v_receipt;
end;
$$;
revoke all on function public.finish_game_score(uuid,uuid,text,integer,integer,integer,text,boolean,jsonb,integer,integer,jsonb) from public, anon, authenticated;
grant execute on function public.finish_game_score(uuid,uuid,text,integer,integer,integer,text,boolean,jsonb,integer,integer,jsonb) to service_role;

-- The server checks device proofs before this call. Keep a better account
-- result, do not pay twice, and do not open unrelated intervening missions.
create or replace function public.import_guest_quiz_results(p_user_id uuid, p_results jsonb)
returns void language plpgsql security invoker set search_path = ''
as $$
declare
  v_item record;
  v_course public.courses%rowtype;
  v_progress public.user_course_progress%rowtype;
  v_total integer; v_score integer;
begin
  if p_results is null or jsonb_typeof(p_results) <> 'array' or jsonb_array_length(p_results) > 50 then raise exception 'Invalid quiz results'; end if;
  perform 1 from public.profiles where id = p_user_id for update;
  if not found then raise exception 'Profile not found'; end if;
  for v_item in select * from jsonb_to_recordset(p_results) as r(course int, score int) order by course loop
    if v_item.course is null or v_item.course not between 1 and 50 or v_item.score not between 8 and 10 or v_item.score is null then
      raise exception 'Invalid guest quiz';
    end if;
    select * into strict v_course from public.courses where course_number = v_item.course;
    select * into strict v_progress from public.user_course_progress where course_id=v_course.id and user_id=p_user_id for update;
    v_total := 0; v_score := 0;
    if v_progress.best_score >= 9000000 then
      v_total := ((v_progress.best_score - 9000000) % 1000000) / 1000;
      v_score := v_progress.best_score % 1000;
    end if;
    if v_total = 0 or v_item.score * v_total > 10 * v_score
        or (v_item.score * v_total = 10 * v_score and v_item.score > v_score) then
      update public.user_course_progress set best_score = 10010000 + v_item.score where id=v_progress.id;
    end if;
    if v_progress.status in ('unlocked','in_progress') or v_item.course = 1 then
      perform public.complete_course_mission_and_grant_rewards(p_user_id,v_course.id,v_course.reward_xp,v_course.reward_gold);
    end if;
  end loop;
end;
$$;
revoke all on function public.import_guest_quiz_results(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.import_guest_quiz_results(uuid,jsonb) to service_role;

-- The dashboard receives only aggregate counts, including dates past the API row limit.
create or replace function public.admin_dashboard_summary(p_today date)
returns jsonb language sql stable security invoker set search_path = ''
as $$
  with visits as (select jsonb_build_object(
    'totalUniqueVisitors',count(distinct visitor_hash), 'totalVisits',count(*),
    'uniqueVisitorsToday',count(distinct visitor_hash) filter (where visit_date=p_today),
    'visitsToday',count(*) filter (where visit_date=p_today),
    'dailyStats',(select coalesce(jsonb_agg(jsonb_build_object('date',d.visit_date,'uniqueVisitors',d.visitors,'totalVisits',d.visits)
       order by d.visit_date desc),'[]'::jsonb) from (
       select visit_date,count(distinct visitor_hash) as visitors,count(*) as visits from public.site_visits
         where visit_date between p_today-29 and p_today group by visit_date
     ) d)
  ) as value from public.site_visits)
  select jsonb_build_object(
    'visitors', (select value from visits), 'totalUsers', count(*),
    'usersByRole', jsonb_build_object('students',count(*) filter(where role='student'),
      'teachers',count(*) filter(where role='teacher'),'admins',count(*) filter(where role='admin')),
    'totalXP',coalesce(sum(xp),0),'totalGold',coalesce(sum(gold),0),
    'averageLevel',coalesce(round(avg(coalesce(level,0))),0),
    'recentUsers',(select coalesce(jsonb_agg(to_jsonb(r) order by r.created_at desc, r.id),'[]'::jsonb) from (
       select id,username,role,created_at from public.profiles order by created_at desc,id limit 5
     ) r)
  ) from public.profiles;
$$;
revoke all on function public.admin_dashboard_summary(date) from public, anon, authenticated;
grant execute on function public.admin_dashboard_summary(date) to service_role;

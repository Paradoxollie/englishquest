-- Validation, récompense et ouverture du cours suivant dans une transaction.
-- Seul le serveur peut appeler cette fonction ; les droits RLS restent actifs.
create or replace function public.complete_course_mission_and_grant_rewards(
  p_user_id uuid, p_course_id uuid, p_reward_xp integer, p_reward_gold integer
) returns jsonb
language plpgsql security invoker set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
  v_progress public.user_course_progress%rowtype;
  v_course_number integer;
  v_xp integer;
  v_gold integer;
  v_level integer;
begin
  if p_reward_xp is null or p_reward_gold is null or p_reward_xp < 0 or p_reward_gold < 0 then
    raise exception 'Invalid course reward';
  end if;
  select * into v_profile from public.profiles where id = p_user_id for update;
  if not found then raise exception 'Profile not found'; end if;
  select * into v_progress from public.user_course_progress
    where user_id = p_user_id and course_id = p_course_id for update;
  if not found then raise exception 'Progress entry not found'; end if;
  if v_progress.status = 'completed' then
    return jsonb_build_object('granted', false, 'level', coalesce(v_profile.level, 1), 'previousLevel', coalesce(v_profile.level, 1));
  end if;
  select course_number into v_course_number from public.courses where id = p_course_id;
  if v_course_number is null then raise exception 'Course not found'; end if;
  if v_progress.status = 'locked' and v_course_number <> 1 and not exists (
    select 1 from public.user_course_progress p join public.courses c on c.id = p.course_id
      where p.user_id = p_user_id and c.course_number = v_course_number - 1 and p.status = 'completed'
  ) then raise exception 'Course is locked'; end if;
  v_xp := coalesce(v_profile.xp, 0) + p_reward_xp;
  v_gold := coalesce(v_profile.gold, 0) + p_reward_gold;
  v_level := 1 + greatest(0, v_xp) / 200;
  update public.profiles set xp = v_xp, gold = v_gold, level = v_level, updated_at = now() where id = p_user_id;
  update public.user_course_progress set status = 'completed', completed_at = now(), updated_at = now() where id = v_progress.id;
  update public.user_course_progress p set status = 'unlocked', updated_at = now()
    from public.courses c where p.course_id = c.id and c.course_number = v_course_number + 1
    and p.user_id = p_user_id and p.status = 'locked';
  return jsonb_build_object('granted', true, 'level', v_level, 'previousLevel', coalesce(v_profile.level, 1));
end;
$$;
revoke all on function public.complete_course_mission_and_grant_rewards(uuid, uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.complete_course_mission_and_grant_rewards(uuid, uuid, integer, integer) to service_role;

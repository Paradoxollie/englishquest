-- The placement test opens chapters. Only a real passing course quiz earns
-- the course reward. Merge both kinds of verified device results under one profile lock.
create or replace function public.apply_verified_placement(
  p_user_id uuid, p_chapter integer, p_results jsonb
) returns integer language plpgsql security invoker set search_path = ''
as $$
declare
  v_chapter integer; v_first integer; v_course public.courses%rowtype;
  v_progress public.user_course_progress%rowtype; v_total integer; v_score integer;
begin
  if p_chapter is null or p_chapter not between 1 and 5 then raise exception 'Invalid placement chapter'; end if;
  select greatest(coalesce(placement_chapter,1),p_chapter) into strict v_chapter
    from public.profiles where id = p_user_id for update;
  v_first := 1 + (v_chapter-1)*10;
  if not exists(select 1 from public.courses where course_number = v_first) then raise exception 'Placement course missing'; end if;
  perform public.import_guest_quiz_results(p_user_id,p_results);
  for v_course in select * from public.courses where course_number between 1 and 50 order by course_number loop
    select * into strict v_progress from public.user_course_progress
      where user_id=p_user_id and course_id=v_course.id for update;
    if v_progress.status = 'completed' then continue; end if;
    if v_course.course_number = v_first and v_progress.status = 'locked' then
      update public.user_course_progress set status='unlocked',updated_at=now() where id=v_progress.id;
      v_progress.status := 'unlocked';
    end if;
    v_total := 0; v_score := 0;
    if v_progress.best_score >= 9000000 then
      v_total := ((v_progress.best_score-9000000) % 1000000) / 1000;
      v_score := v_progress.best_score % 1000;
    end if;
    if v_total > 0 and v_score*5 >= v_total*4
       and (v_course.course_number < v_first or v_progress.status in ('unlocked','in_progress')) then
      -- The prerequisites are acquired by placement; this specific quiz was passed.
      if v_progress.status = 'locked' then
        update public.user_course_progress set status='unlocked' where id=v_progress.id;
      end if;
      perform public.complete_course_mission_and_grant_rewards(p_user_id,v_course.id,v_course.reward_xp,v_course.reward_gold);
    elsif v_course.course_number < v_first then
      -- Keep previous reading/quiz data distinguishable from a played mission.
      update public.user_course_progress set status='completed',
        best_score=case when best_score>=9000000 then best_score+10000000 else 8000000 end,
        completed_at=now(),updated_at=now() where id=v_progress.id;
    end if;
  end loop;
  update public.profiles set placement_chapter=v_chapter,placement_at=now()
    where id=p_user_id and (placement_at is null or placement_chapter is distinct from v_chapter);
  return v_chapter;
end;
$$;
revoke all on function public.apply_verified_placement(uuid,integer,jsonb) from public,anon,authenticated;
grant execute on function public.apply_verified_placement(uuid,integer,jsonb) to service_role;

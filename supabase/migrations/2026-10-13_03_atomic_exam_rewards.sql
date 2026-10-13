-- Une tentative, sa première réussite et sa récompense doivent être validées
-- ensemble. Le navigateur n'a pas le droit d'appeler cette fonction.
create or replace function public.record_chapter_exam_and_grant_rewards(
  p_user_id uuid,
  p_chapter integer,
  p_correct integer,
  p_total integer,
  p_reward_xp integer,
  p_reward_gold integer
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_profile record;
  v_exam public.chapter_exams%rowtype;
  v_first_pass boolean;
  v_xp integer;
  v_gold integer;
  v_level integer;
  v_now timestamptz := now();
begin
  if p_user_id is null or p_chapter is null or p_chapter not between 1 and 5
    or p_correct is null or p_total is null or p_total <> 15
    or p_correct < 0 or p_correct > p_total
    or p_reward_xp is null or p_reward_gold is null
    or p_reward_xp < 0 or p_reward_gold < 0 then
    raise exception 'Invalid chapter exam result' using errcode = '22023';
  end if;

  -- Même ordre de verrouillage que les récompenses de cours.
  select id, xp, gold, level into v_profile
  from public.profiles where id = p_user_id for update;
  if not found then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;

  insert into public.chapter_exams (user_id, chapter)
  values (p_user_id, p_chapter)
  on conflict (user_id, chapter) do nothing;

  select * into v_exam from public.chapter_exams
  where user_id = p_user_id and chapter = p_chapter for update;
  v_first_pass := p_correct >= 12 and v_exam.passed_at is null;

  update public.chapter_exams
  set best_correct = greatest(best_correct, p_correct), total = p_total,
      attempts = attempts + 1,
      passed_at = case when v_first_pass then v_now else passed_at end,
      updated_at = v_now
  where id = v_exam.id;

  if v_first_pass then
    v_xp := coalesce(v_profile.xp, 0) + p_reward_xp;
    v_gold := coalesce(v_profile.gold, 0) + p_reward_gold;
    v_level := 1 + greatest(0, v_xp) / 200;
    update public.profiles
    set xp = v_xp, gold = v_gold, level = v_level, updated_at = v_now
    where id = p_user_id;
  end if;

  return jsonb_build_object(
    'saved', true,
    'firstPass', v_first_pass,
    'rewards', jsonb_build_object(
      'xp', case when v_first_pass then p_reward_xp else 0 end,
      'gold', case when v_first_pass then p_reward_gold else 0 end
    ),
    'newLevel', case when v_first_pass and v_level > coalesce(v_profile.level, 1) then v_level else null end
  );
end;
$$;

revoke all on function public.record_chapter_exam_and_grant_rewards(uuid, integer, integer, integer, integer, integer)
from public, anon, authenticated;
grant execute on function public.record_chapter_exam_and_grant_rewards(uuid, integer, integer, integer, integer, integer)
to service_role;

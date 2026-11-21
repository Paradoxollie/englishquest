-- Align the weekly class overview with the placement markers used by course progress.
create or replace function public.class_practice_week(p_user uuid, p_class uuid)
returns table(pupil text, games bigint, missions bigint) language sql stable set search_path = '' as $$
  select p.username::text,
    (select count(*) from public.game_scores g
     where g.user_id=m.user_id and g.created_at>=greatest(m.joined_at,now()-interval '7 days')),
    (select count(*) from public.user_course_progress cp
     where cp.user_id=m.user_id and cp.status='completed'
       and cp.completed_at>=greatest(m.joined_at,now()-interval '7 days')
       and cp.best_score is distinct from 8000000 and coalesce(cp.best_score,0)<19000000)
  from public.classes c join public.profiles viewer on viewer.id=p_user
    join public.class_members m on m.class_id=c.id join public.profiles p on p.id=m.user_id
  where c.id=p_class and (viewer.role='admin' or (viewer.role='teacher' and c.teacher_id=p_user))
  order by lower(p.username),p.id
$$;
revoke all on function public.class_practice_week(uuid,uuid) from public,anon,authenticated;
grant execute on function public.class_practice_week(uuid,uuid) to service_role;

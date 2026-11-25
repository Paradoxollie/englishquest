-- Detailed historical visits are kept until their owner opts into backfilling the daily totals.
create table public.site_visit_retention (
  singleton boolean primary key default true check(singleton),
  detail_from timestamptz not null default now()
);
insert into public.site_visit_retention default values;
create table public.site_visit_days (
  visit_date date primary key,
  unique_visitors bigint not null,
  total_visits bigint not null
);
alter table public.site_visit_retention enable row level security;
alter table public.site_visit_days enable row level security;
revoke all on public.site_visit_retention,public.site_visit_days from public,anon,authenticated;
grant select,insert,update on public.site_visit_days to service_role;
grant select on public.site_visit_retention to service_role;

create function public.purge_temporary_class_data() returns void language plpgsql set search_path='' as $$
declare
  first_detail timestamptz;
  closed_day date;
begin
  if not pg_try_advisory_xact_lock(5371526, 10) then return; end if;
  delete from public.class_guest_join_limits where expires_at<=now();
  update public.class_guests set token_hash=null where token_hash is not null and access_until<=now();
  delete from public.class_guests where report_until<=now();
  delete from public.class_live_sessions where coalesce(stopped_at,ends_at,created_at)<=now()-interval '10 days';
  select detail_from into strict first_detail from public.site_visit_retention;
  -- Snapshot full UTC days before deleting any detail. Rollback restores both sides on failure.
  for closed_day in select distinct v.visit_date from public.site_visits v
    where v.user_id is null and v.visited_at>=first_detail
      and v.visit_date<(now() at time zone 'UTC')::date-10
    order by v.visit_date limit 3 loop
    insert into public.site_visit_days(visit_date,unique_visitors,total_visits)
      select closed_day,count(distinct visitor_hash),count(*) from public.site_visits where visit_date=closed_day
      on conflict(visit_date) do nothing;
    delete from public.site_visits where visit_date=closed_day and user_id is null and visited_at>=first_detail;
  end loop;
end; $$;
revoke all on function public.purge_temporary_class_data() from public,anon,authenticated;
grant execute on function public.purge_temporary_class_data() to service_role;

create or replace function public.get_visitor_stats(start_date date default null,end_date date default null)
returns table(visit_date date,unique_visitors bigint,total_visits bigint) language sql stable security definer set search_path='' as $$
  select d.visit_date,d.unique_visitors,d.total_visits from public.site_visit_days d
    where (start_date is null or d.visit_date>=start_date) and (end_date is null or d.visit_date<=end_date)
  union all
  select v.visit_date,count(distinct v.visitor_hash),count(*) from public.site_visits v
    where (start_date is null or v.visit_date>=start_date) and (end_date is null or v.visit_date<=end_date)
      and not exists (select from public.site_visit_days d where d.visit_date=v.visit_date)
    group by v.visit_date order by 1 desc;
$$;
create or replace function public.get_total_visits() returns bigint language sql stable security definer set search_path='' as $$
  select coalesce(sum(total_visits),0)::bigint from public.get_visitor_stats(null,null);
$$;
-- A network cannot be deduplicated across archived days once its fingerprint is erased.
create or replace function public.get_total_unique_visitors() returns bigint language sql stable security definer set search_path='' as $$
  select count(distinct visitor_hash) from public.site_visits where visited_at>=now()-interval '10 days';
$$;
create or replace function public.admin_dashboard_summary(p_today date)
returns jsonb language sql stable set search_path='' as $$
  with daily as materialized (select * from public.get_visitor_stats(null,null)),
  visits as (select jsonb_build_object(
    'totalUniqueVisitors',public.get_total_unique_visitors(), 'totalVisits',coalesce(sum(total_visits),0),
    'uniqueVisitorsToday',coalesce(max(unique_visitors) filter(where visit_date=p_today),0),
    'visitsToday',coalesce(max(total_visits) filter(where visit_date=p_today),0),
    'dailyStats',coalesce(jsonb_agg(jsonb_build_object('date',visit_date,'uniqueVisitors',unique_visitors,'totalVisits',total_visits)
      order by visit_date desc) filter(where visit_date between p_today-29 and p_today),'[]'::jsonb)
  ) as value from daily)
  select jsonb_build_object(
    'visitors',(select value from visits),'totalUsers',count(*),
    'usersByRole',jsonb_build_object('students',count(*) filter(where role='student'),'teachers',count(*) filter(where role='teacher'),'admins',count(*) filter(where role='admin')),
    'totalXP',coalesce(sum(xp),0),'totalGold',coalesce(sum(gold),0),'averageLevel',coalesce(round(avg(coalesce(level,0))),0),
    'recentUsers',(select coalesce(jsonb_agg(to_jsonb(r) order by r.created_at desc,r.id),'[]'::jsonb) from (
      select id,username,role,created_at from public.profiles order by created_at desc,id limit 5) r)
  ) from public.profiles;
$$;

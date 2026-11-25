-- Freeze the comparable daily totals before allowing the hourly job to remove old unlinked detail.
-- All comparisons and writes use the same transaction; any mismatch aborts the change.
do $archive$
declare
  last_day date := (now() at time zone 'UTC')::date-11;
  raw_visits bigint; recorded_visits bigint; raw_openings bigint; recorded_openings bigint;
begin
  perform pg_advisory_xact_lock(5371526,10);
  insert into public.site_visit_days(visit_date,unique_visitors,total_visits)
  select v.visit_date,count(distinct v.visitor_hash),count(*) from public.site_visits v
  where v.visit_date<=last_day and not exists(select from public.site_visit_days d where d.visit_date=v.visit_date)
  group by v.visit_date;
  -- On newly archived dates every detailed visit is still present at this point.
  select count(*) into raw_visits from public.site_visits v where v.visit_date<=last_day;
  select coalesce(sum(d.total_visits),0) into recorded_visits from public.site_visit_days d where d.visit_date<=last_day;
  select count(*) into raw_openings from public.site_visits v
    cross join lateral regexp_match(split_part(v.path,'?',1),'^/play/([^/]+)/?$') as parts
    where v.visit_date<=last_day and public.public_game_slug(parts[1]);
  select coalesce(sum(g.openings),0) into recorded_openings from public.game_page_days g where g.source_day<=last_day;
  if raw_visits<>recorded_visits or raw_openings<>recorded_openings or exists (
    select from public.site_visit_days d join (
      select visit_date,count(distinct visitor_hash) as networks,count(*) as views from public.site_visits
      where visit_date<=last_day group by visit_date
    ) v using(visit_date) where d.unique_visitors<>v.networks or d.total_visits<>v.views
  ) then raise exception 'Daily traffic counts differ; original detail retained'; end if;
  update public.site_visit_retention set detail_from='-infinity' where singleton;
end; $archive$;

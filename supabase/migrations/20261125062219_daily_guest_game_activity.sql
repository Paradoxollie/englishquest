-- No identity, score, device or per-round row is needed to count public games.
create function public.public_game_slug(p_slug text) returns boolean
language sql immutable set search_path='' as $$
  select p_slug in ('enigma-scroll','space-lex','speed-verb-challenge','wordfall','flash-translation',
                    'grammar-rush','flashback','spell-strike','echo-signal');
$$;
create table public.guest_game_days (
  play_date date not null,
  game_slug text not null check (public.public_game_slug(game_slug)),
  started bigint not null default 0,
  finished bigint not null default 0,
  primary key(play_date, game_slug)
);
create table public.game_page_days (
  source_day date not null,
  play_date date not null,
  game_slug text not null check (public.public_game_slug(game_slug)),
  openings bigint not null,
  primary key(source_day, play_date, game_slug)
);
alter table public.guest_game_days enable row level security;
alter table public.game_page_days enable row level security;
revoke all on public.guest_game_days,public.game_page_days from public,anon,authenticated;
grant select,insert,update on public.guest_game_days,public.game_page_days to service_role;

create function public.count_guest_game(p_slug text,p_event text) returns void
language plpgsql set search_path='' as $$
begin
  if not coalesce(public.public_game_slug(p_slug),false) or p_event is null or p_event not in ('started','finished')
    then raise exception 'Invalid game event'; end if;
  insert into public.guest_game_days as d(play_date,game_slug,started,finished)
    values((now() at time zone 'Europe/Paris')::date,p_slug,(p_event='started')::int,(p_event='finished')::int)
    on conflict(play_date,game_slug) do update set started=d.started+excluded.started,finished=d.finished+excluded.finished;
end; $$;

create function public.archive_game_page_counts() returns trigger
language plpgsql set search_path='' as $$
begin
  insert into public.game_page_days(source_day,play_date,game_slug,openings)
    select new.visit_date,(v.visited_at at time zone 'Europe/Paris')::date,parts[1],count(*)
    from public.site_visits v cross join lateral regexp_match(split_part(v.path,'?',1),'^/play/([^/]+)/?$') as parts
    where v.visit_date=new.visit_date and public.public_game_slug(parts[1]) group by 2,3;
  return new;
end; $$;
create trigger keep_game_page_counts after insert on public.site_visit_days
for each row execute function public.archive_game_page_counts();

create function public.game_usage_between(p_from date,p_until date)
returns table(play_date date,game_slug text,openings bigint,started bigint,finished bigint)
language sql stable set search_path='' as $$
  with events as (
    select a.play_date,a.game_slug,a.openings,0::bigint as started,0::bigint as finished
    from public.game_page_days a where a.play_date between p_from and p_until
    union all
    select (v.visited_at at time zone 'Europe/Paris')::date,parts[1],count(*),0,0
    from public.site_visits v cross join lateral regexp_match(split_part(v.path,'?',1),'^/play/([^/]+)/?$') as parts
    where v.visited_at >= (p_from::timestamp at time zone 'Europe/Paris')
      and v.visited_at < ((p_until+1)::timestamp at time zone 'Europe/Paris')
      and not exists (select from public.site_visit_days a where a.visit_date=v.visit_date)
      and public.public_game_slug(parts[1]) group by 1,2
    union all
    select g.play_date,g.game_slug,0,g.started,g.finished from public.guest_game_days g
      where g.play_date between p_from and p_until
  )
  select e.play_date,e.game_slug,sum(e.openings)::bigint,sum(e.started)::bigint,sum(e.finished)::bigint from events e
    group by 1,2 order by 1 desc,2;
$$;
revoke all on function public.public_game_slug(text),public.count_guest_game(text,text),public.archive_game_page_counts(),
  public.game_usage_between(date,date) from public,anon,authenticated;
grant execute on function public.public_game_slug(text),public.count_guest_game(text,text),public.game_usage_between(date,date) to service_role;

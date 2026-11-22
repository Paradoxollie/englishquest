create table public.adventure_checkpoints (
  user_id uuid not null references auth.users(id) on delete cascade,
  mission smallint not null check (mission between 1 and 5),
  stage smallint not null check (stage between 0 and 7),
  draft jsonb,
  draft_version integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, mission)
);
alter table public.adventure_checkpoints enable row level security;
revoke all on public.adventure_checkpoints from public, anon, authenticated;
grant select, insert, update on public.adventure_checkpoints to service_role;

create function public.keep_adventure_checkpoint(p_user uuid, p_mission integer, p_stage integer)
returns void language sql security invoker set search_path = '' as $$
  insert into public.adventure_checkpoints as saved (user_id, mission, stage)
    values (p_user, p_mission, p_stage)
  on conflict (user_id, mission) do update set stage = excluded.stage, draft = null, draft_version = 0, updated_at = now()
    where saved.stage < excluded.stage;
$$;
revoke all on function public.keep_adventure_checkpoint(uuid, integer, integer) from public, anon, authenticated;
grant execute on function public.keep_adventure_checkpoint(uuid, integer, integer) to service_role;

create function public.save_adventure_draft(p_user uuid, p_mission integer, p_stage integer, p_version integer, p_draft jsonb)
returns integer language plpgsql security invoker set search_path = '' as $$
declare v_version integer;
begin
  if jsonb_typeof(p_draft) is distinct from 'object' or octet_length(p_draft::text) > 4096 then return -1; end if;
  if p_stage = 0 and p_version = 0 then
    insert into public.adventure_checkpoints (user_id, mission, stage) values (p_user, p_mission, 0)
      on conflict (user_id, mission) do nothing;
  end if;
  update public.adventure_checkpoints set draft = p_draft, draft_version = draft_version + 1, updated_at = now()
    where user_id = p_user and mission = p_mission and stage = p_stage and draft_version = p_version
    returning draft_version into v_version;
  return coalesce(v_version, -1);
end;
$$;
revoke all on function public.save_adventure_draft(uuid, integer, integer, integer, jsonb) from public, anon, authenticated;
grant execute on function public.save_adventure_draft(uuid, integer, integer, integer, jsonb) to service_role;

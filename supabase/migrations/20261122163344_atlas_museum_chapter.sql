alter table public.adventure_checkpoints
  drop constraint adventure_checkpoints_mission_check,
  add constraint adventure_checkpoints_mission_check check (mission between 1 and 15);

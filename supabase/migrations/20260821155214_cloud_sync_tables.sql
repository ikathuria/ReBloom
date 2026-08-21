-- ReBloom opt-in cloud sync: private per-user copies of enrollments + track points.
-- Scores + blooms only — NEVER images. Every row is owner-scoped by RLS.

-- ── enrollments ────────────────────────────────────────────────────────────
create table if not exists public.enrollments (
  user_id     uuid not null references auth.users (id) on delete cascade,
  track_id    text not null,
  cadence     text not null,
  enrolled_at timestamptz not null,
  primary key (user_id, track_id)
);

alter table public.enrollments enable row level security;
grant select, insert, update, delete on public.enrollments to authenticated;

create policy "enrollments_select_own" on public.enrollments
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "enrollments_insert_own" on public.enrollments
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "enrollments_update_own" on public.enrollments
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "enrollments_delete_own" on public.enrollments
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ── track_points ───────────────────────────────────────────────────────────
create table if not exists public.track_points (
  id          text primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  track_id    text not null,
  captured_at timestamptz not null,
  scores_json text not null,
  bloom       integer not null
);

alter table public.track_points enable row level security;
grant select, insert, update, delete on public.track_points to authenticated;

create policy "track_points_select_own" on public.track_points
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "track_points_insert_own" on public.track_points
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "track_points_update_own" on public.track_points
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "track_points_delete_own" on public.track_points
  for delete to authenticated using ((select auth.uid()) = user_id);

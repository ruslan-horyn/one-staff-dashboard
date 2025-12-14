-- ============================================================================
-- Migration: 20251209220748_functions_triggers.sql
-- Purpose: Create database functions and triggers for the One Staff Dashboard
-- Functions:
--   - public.user_role(): Helper function to get current user's role
--   - update_updated_at_column(): Auto-update updated_at timestamp
--   - normalize_phone(): Normalize phone numbers to digits only
--   - log_assignment_changes(): Create audit log entries
--   - is_worker_available(): Check worker availability
--   - get_hours_report(): Generate worked hours report
--   - end_assignment(): End an assignment with proper status update
--   - cancel_assignment(): Cancel a scheduled assignment
-- Notes:
--   - SECURITY DEFINER used where function needs elevated privileges
--   - STABLE marking for read-only functions (query optimization)
--   - IMMUTABLE marking for deterministic functions
-- ============================================================================

-- ===================
-- Helper Function: public.user_role()
-- ===================
-- Returns the role of the currently authenticated user
-- Used extensively in RLS policies to check permissions
create or replace function public.user_role()
returns user_role as $$
  select role from public.profiles where id = auth.uid()
$$ language sql security definer stable;

comment on function public.user_role() is 'Returns the role of the currently authenticated user from profiles table';

-- ===================
-- Trigger Function: update_updated_at_column()
-- ===================
-- Automatically updates the updated_at column on any row modification
-- Applied to all tables with updated_at column via triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

comment on function update_updated_at_column() is 'Automatically sets updated_at to current timestamp on row update';

-- create triggers for all tables with updated_at column
create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

create trigger update_clients_updated_at
  before update on clients
  for each row execute function update_updated_at_column();

create trigger update_work_locations_updated_at
  before update on work_locations
  for each row execute function update_updated_at_column();

create trigger update_positions_updated_at
  before update on positions
  for each row execute function update_updated_at_column();

create trigger update_temporary_workers_updated_at
  before update on temporary_workers
  for each row execute function update_updated_at_column();

create trigger update_assignments_updated_at
  before update on assignments
  for each row execute function update_updated_at_column();

-- ===================
-- Function: normalize_phone()
-- ===================
-- Removes spaces, dashes, and other formatting characters from phone numbers
-- Preserves the + prefix for international format (e.g., +48 for Poland)
-- Ensures consistent phone number format for unique constraint
create or replace function normalize_phone(phone text)
returns text as $$
declare
  has_plus boolean;
  digits_only text;
begin
  -- check if phone starts with +
  has_plus := phone like '+%';

  -- remove all non-digit characters
  digits_only := regexp_replace(phone, '[^0-9]', '', 'g');

  -- re-add + prefix if it was present
  if has_plus then
    return '+' || digits_only;
  else
    return digits_only;
  end if;
end;
$$ language plpgsql immutable;

comment on function normalize_phone(text) is 'Normalizes phone numbers by removing formatting characters while preserving + prefix';

-- trigger function to normalize phone before insert/update
create or replace function normalize_phone_trigger()
returns trigger as $$
begin
  new.phone = normalize_phone(new.phone);
  return new;
end;
$$ language plpgsql;

-- apply phone normalization to temporary_workers
create trigger normalize_worker_phone
  before insert or update on temporary_workers
  for each row execute function normalize_phone_trigger();

-- ===================
-- Function: log_assignment_changes()
-- ===================
-- Creates audit log entries for all assignment modifications
-- Determines action type based on status changes
create or replace function log_assignment_changes()
returns trigger as $$
declare
  action_name varchar(50);
  old_vals jsonb := null;
  new_vals jsonb := null;
begin
  if tg_op = 'INSERT' then
    action_name := 'created';
    new_vals := to_jsonb(new);
  elsif tg_op = 'UPDATE' then
    old_vals := to_jsonb(old);
    new_vals := to_jsonb(new);

    -- determine specific action based on status change
    if new.status = 'completed' and old.status != 'completed' then
      action_name := 'ended';
    elsif new.status = 'cancelled' and old.status != 'cancelled' then
      action_name := 'cancelled';
    else
      action_name := 'updated';
    end if;
  end if;

  -- insert audit log entry
  insert into assignment_audit_log (
    assignment_id,
    action,
    old_values,
    new_values,
    performed_by
  ) values (
    coalesce(new.id, old.id),
    action_name,
    old_vals,
    new_vals,
    auth.uid()
  );

  return new;
end;
$$ language plpgsql security definer;

comment on function log_assignment_changes() is 'Creates audit log entries for assignment INSERT and UPDATE operations';

-- apply audit logging trigger to assignments
create trigger log_assignment_changes_trigger
  after insert or update on assignments
  for each row execute function log_assignment_changes();

-- ===================
-- Function: is_worker_available()
-- ===================
-- Checks if a worker is available at a given datetime
-- Note: This is informational only - overlapping assignments are allowed by design
-- Returns true if worker has no active/scheduled assignments at the given time
create or replace function is_worker_available(
  p_worker_id uuid,
  p_check_datetime timestamptz
)
returns boolean as $$
begin
  return not exists (
    select 1 from assignments
    where worker_id = p_worker_id
      and status in ('scheduled', 'active')
      and start_at <= p_check_datetime
      and (end_at is null or end_at > p_check_datetime)
  );
end;
$$ language plpgsql stable;

comment on function is_worker_available(uuid, timestamptz) is 'Checks if a worker is available at a specific datetime - informational, does not block overlaps';

-- ===================
-- Function: get_hours_report()
-- ===================
-- Generates a report of worked hours for a date range
-- Optionally filtered by client
-- Returns aggregated hours per worker per location
create or replace function get_hours_report(
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_client_id uuid default null
)
returns table (
  worker_id uuid,
  worker_name text,
  work_location_name varchar(255),
  client_name varchar(255),
  total_hours numeric
) as $$
begin
  return query
  select
    tw.id as worker_id,
    (tw.first_name || ' ' || tw.last_name) as worker_name,
    wl.name as work_location_name,
    c.name as client_name,
    round(
      extract(epoch from sum(
        least(coalesce(a.end_at, now()), p_end_date) -
        greatest(a.start_at, p_start_date)
      )) / 3600,
      2
    ) as total_hours
  from assignments a
  join temporary_workers tw on a.worker_id = tw.id
  join positions p on a.position_id = p.id
  join work_locations wl on p.work_location_id = wl.id
  join clients c on wl.client_id = c.id
  where a.status in ('active', 'completed')
    and a.start_at < p_end_date
    and (a.end_at is null or a.end_at > p_start_date)
    and tw.deleted_at is null
    and (p_client_id is null or c.id = p_client_id)
  group by tw.id, tw.first_name, tw.last_name, wl.name, c.name
  order by worker_name, work_location_name;
end;
$$ language plpgsql stable;

comment on function get_hours_report(timestamptz, timestamptz, uuid) is 'Generates worked hours report aggregated by worker and location for a date range';

-- ===================
-- Function: end_assignment()
-- ===================
-- Ends an active or scheduled assignment with proper status update
-- Sets end_at, status to completed, and records who ended it
-- Raises exception if assignment not found or already ended
create or replace function end_assignment(
  p_assignment_id uuid,
  p_end_at timestamptz default now()
)
returns assignments as $$
declare
  v_assignment assignments;
begin
  update assignments
  set
    end_at = p_end_at,
    status = 'completed',
    ended_by = auth.uid()
  where id = p_assignment_id
    and status in ('scheduled', 'active')
    and end_at is null
  returning * into v_assignment;

  if v_assignment is null then
    raise exception 'Assignment not found or already ended';
  end if;

  return v_assignment;
end;
$$ language plpgsql security definer;

comment on function end_assignment(uuid, timestamptz) is 'Ends an assignment by setting end_at, status to completed, and recording who ended it';

-- ===================
-- Function: cancel_assignment()
-- ===================
-- Cancels a scheduled assignment that hasn't started yet
-- Only works for assignments with status 'scheduled' and start_at in the future
-- Raises exception if assignment cannot be cancelled
create or replace function cancel_assignment(
  p_assignment_id uuid
)
returns assignments as $$
declare
  v_assignment assignments;
begin
  update assignments
  set
    status = 'cancelled',
    cancelled_by = auth.uid()
  where id = p_assignment_id
    and status = 'scheduled'
    and start_at > now()
  returning * into v_assignment;

  if v_assignment is null then
    raise exception 'Assignment cannot be cancelled (not found, already started, or not in scheduled status)';
  end if;

  return v_assignment;
end;
$$ language plpgsql security definer;

comment on function cancel_assignment(uuid) is 'Cancels a scheduled assignment that has not yet started';

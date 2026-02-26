create table if not exists public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  model_name text not null,
  prompt_version text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  raw_response jsonb,
  success boolean not null default false,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

-- Indexes
create index idx_ai_jobs_inquiry_id on public.ai_jobs (inquiry_id);
create index idx_ai_jobs_model_name on public.ai_jobs (model_name);
create index idx_ai_jobs_success on public.ai_jobs (success);
create index idx_ai_jobs_started_at on public.ai_jobs (started_at desc);

-- Enable Row Level Security
alter table public.ai_jobs enable row level security;

-- Allow authenticated users to read ai_jobs
create policy "Authenticated users can read ai_jobs"
  on public.ai_jobs for select
  to authenticated
  using (true);

-- Allow authenticated users to insert ai_jobs
create policy "Authenticated users can insert ai_jobs"
  on public.ai_jobs for insert
  to authenticated
  with check (true);

-- Allow authenticated users to update ai_jobs (e.g. mark finished)
create policy "Authenticated users can update ai_jobs"
  on public.ai_jobs for update
  to authenticated
  using (true)
  with check (true);

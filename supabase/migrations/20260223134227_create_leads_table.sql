-- Enum types
create type public.lead_category as enum ('hot', 'warm', 'cold');
create type public.lead_status as enum ('new', 'replied', 'closed');

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null unique references public.inquiries (id) on delete cascade,
  summary text not null,
  category lead_category not null default 'cold',
  confidence_score decimal not null default 0 check (confidence_score >= 0 and confidence_score <= 1),
  recommended_reply text,
  status lead_status not null default 'new',
  processed_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_leads_inquiry_id on public.leads (inquiry_id);
create index idx_leads_category on public.leads (category);
create index idx_leads_status on public.leads (status);
create index idx_leads_confidence_score on public.leads (confidence_score desc);

-- Enable Row Level Security
alter table public.leads enable row level security;

-- Allow authenticated users to read leads
create policy "Authenticated users can read leads"
  on public.leads for select
  to authenticated
  using (true);

-- Allow authenticated users to update leads (e.g. change status)
create policy "Authenticated users can update leads"
  on public.leads for update
  to authenticated
  using (true)
  with check (true);

-- Allow authenticated users to insert leads
create policy "Authenticated users can insert leads"
  on public.leads for insert
  to authenticated
  with check (true);

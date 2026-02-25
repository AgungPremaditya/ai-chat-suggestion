create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  source text not null default 'web' check (source in ('web', 'manual', 'api', 'email')),
  attachments jsonb default '[]'::jsonb,
  ip_address inet,
  user_agent text,
  consent boolean not null default false,
  created_at timestamptz not null default now()
);

-- Index for common query patterns
create index idx_inquiries_email on public.inquiries (email);
create index idx_inquiries_source on public.inquiries (source);
create index idx_inquiries_created_at on public.inquiries (created_at desc);

-- Enable Row Level Security
alter table public.inquiries enable row level security;

-- Allow authenticated users to read all inquiries
create policy "Authenticated users can read inquiries"
  on public.inquiries for select
  to authenticated
  using (true);

-- Allow anonymous inserts (for public-facing forms)
create policy "Anyone can submit an inquiry"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

create table if not exists public.early_access_requests (
  id uuid primary key default gen_random_uuid(),
  business_name text not null check (char_length(business_name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  website_url text,
  industry text not null default 'General local business',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email, industry)
);

alter table public.early_access_requests enable row level security;
revoke all on public.early_access_requests from anon, authenticated;

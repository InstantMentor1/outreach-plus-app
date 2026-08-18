create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(), business_name text not null, business_type text not null, location text not null, website_url text, status text not null default 'draft' check (status in ('draft','ready','invited','active','revoked')), invitation_token_hash text unique, invitation_expires_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.brand_documents (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete cascade, storage_path text not null unique, original_filename text not null, mime_type text not null check (mime_type = 'application/pdf'), file_size bigint not null check (file_size > 0 and file_size <= 15728640), analysis_status text not null default 'pending' check (analysis_status in ('pending','processing','complete','failed')), analysis_error text, created_at timestamptz not null default now()
);
create table if not exists public.brand_profiles (
  id uuid primary key default gen_random_uuid(), client_id uuid not null unique references public.clients(id) on delete cascade, business_summary text, target_audience text, brand_positioning text, tone_of_voice text, brand_values jsonb not null default '[]'::jsonb, primary_colour text, secondary_colours jsonb not null default '[]'::jsonb, fonts jsonb not null default '[]'::jsonb, visual_style jsonb not null default '[]'::jsonb, logo_rules jsonb not null default '[]'::jsonb, content_guidelines jsonb not null default '[]'::jsonb, prohibited_usage jsonb not null default '[]'::jsonb, additional_context jsonb not null default '[]'::jsonb, extraction_confidence jsonb not null default '{}'::jsonb, reviewed boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.clients(id) on delete cascade, title text not null default 'Marketing conversation', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade, client_id uuid not null references public.clients(id) on delete cascade, role text not null check (role in ('user','assistant')), content text not null check (char_length(content) between 1 and 4000), created_at timestamptz not null default now()
);
create index if not exists brand_documents_client_id_idx on public.brand_documents(client_id, created_at desc);
create index if not exists brand_profiles_client_id_idx on public.brand_profiles(client_id);
create index if not exists conversations_client_id_idx on public.conversations(client_id, updated_at desc);
create index if not exists messages_conversation_id_idx on public.messages(conversation_id, created_at);
create index if not exists messages_client_id_idx on public.messages(client_id, created_at);
alter table public.clients enable row level security; alter table public.brand_documents enable row level security; alter table public.brand_profiles enable row level security; alter table public.conversations enable row level security; alter table public.messages enable row level security;
revoke all on public.clients, public.brand_documents, public.brand_profiles, public.conversations, public.messages from anon, authenticated;
-- One-time dashboard step: create a private bucket named brand-books, restrict MIME types to application/pdf and set file-size limit to 15 MB. Do not make it public.

alter table public.clients add column if not exists owner_user_id uuid unique references auth.users(id) on delete set null;
create index if not exists clients_owner_user_id_idx on public.clients(owner_user_id) where owner_user_id is not null;

alter table public.clients add column if not exists whatsapp_phone text;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'clients_whatsapp_phone_unique') then
    alter table public.clients add constraint clients_whatsapp_phone_unique unique (whatsapp_phone);
  end if;
end $$;
alter table public.messages add column if not exists external_message_id text;
create unique index if not exists messages_external_message_id_idx on public.messages(external_message_id) where external_message_id is not null;
create index if not exists clients_whatsapp_phone_idx on public.clients(whatsapp_phone) where whatsapp_phone is not null;

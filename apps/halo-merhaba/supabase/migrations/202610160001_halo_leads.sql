-- Apply only to the dedicated Halo Merhaba Supabase project.
-- No unrelated tables, policies, grants, or authentication settings are changed.
begin;
create table if not exists public.halo_admin_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 is_active boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.halo_leads (
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('marriage','documents','translation','interpreter','consultation','course','precheck','product_interest')),
 locale text not null check(locale in ('id','tr')),
 name text not null default '' check(char_length(name)<=120),
 email text not null default '' check(char_length(email)<=254),
 whatsapp text not null default '' check(char_length(whatsapp)<=30),
 summary text not null default '' check(char_length(summary)<=1800),
 answers jsonb not null default '{}'::jsonb check(jsonb_typeof(answers)='object' and octet_length(answers::text)<=9000),
 consent boolean not null check(consent=true),
 consent_version text not null default 'halo-privacy-v1',
 status text not null default 'new' check(status in ('new','contacted','waiting','in_progress','completed','closed')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(email<>'' or whatsapp<>'')
);
create index if not exists halo_leads_created_idx on public.halo_leads(created_at desc);
create index if not exists halo_leads_kind_status_idx on public.halo_leads(kind,status);
create table if not exists public.halo_lead_notes (
 id uuid primary key default gen_random_uuid(),
 lead_id uuid not null references public.halo_leads(id) on delete cascade,
 author_id uuid not null references auth.users(id),
 body text not null check(char_length(body) between 1 and 3000),
 created_at timestamptz not null default now()
);
create index if not exists halo_notes_lead_idx on public.halo_lead_notes(lead_id,created_at);
create table if not exists public.halo_product_interest (
 id uuid primary key default gen_random_uuid(),
 lead_id uuid not null unique references public.halo_leads(id) on delete cascade,
 email text not null check(char_length(email)<=254 and email<>''),
 product_id text not null check(char_length(product_id) between 1 and 100),
 consent boolean not null check(consent=true),
 created_at timestamptz not null default now()
);
create table if not exists public.halo_intake_limits (
 rate_key text primary key check(rate_key ~ '^[a-f0-9]{64}$'),
 window_start timestamptz not null,
 attempts integer not null check(attempts>0)
);
alter table public.halo_admin_profiles enable row level security;
alter table public.halo_leads enable row level security;
alter table public.halo_lead_notes enable row level security;
alter table public.halo_product_interest enable row level security;
alter table public.halo_intake_limits enable row level security;
revoke all on public.halo_admin_profiles,public.halo_leads,public.halo_lead_notes,public.halo_product_interest,public.halo_intake_limits from public,anon,authenticated;
grant select on public.halo_admin_profiles,public.halo_leads,public.halo_lead_notes,public.halo_product_interest to authenticated;
grant all on public.halo_admin_profiles,public.halo_leads,public.halo_lead_notes,public.halo_product_interest,public.halo_intake_limits to service_role;
create or replace function public.halo_is_admin() returns boolean
language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.halo_admin_profiles where user_id=auth.uid() and is_active=true); $$;
revoke all on function public.halo_is_admin() from public,anon;
grant execute on function public.halo_is_admin() to authenticated,service_role;
create policy halo_admin_self_read on public.halo_admin_profiles for select to authenticated using(user_id=auth.uid());
create policy halo_admin_leads_read on public.halo_leads for select to authenticated using(public.halo_is_admin());
create policy halo_admin_notes_read on public.halo_lead_notes for select to authenticated using(public.halo_is_admin());
create policy halo_admin_interest_read on public.halo_product_interest for select to authenticated using(public.halo_is_admin());
-- No anonymous INSERT/SELECT policy; approved public forms submit through the server only.
-- No authenticated direct INSERT/UPDATE policy. The admin RPC checks role and limits writable columns.
create or replace function public.halo_submit_lead(
 p_kind text,p_locale text,p_name text,p_email text,p_whatsapp text,p_summary text,p_answers jsonb,p_consent boolean,p_rate_key text
) returns uuid language plpgsql security definer set search_path=public
as $$
declare new_id uuid; n integer;
begin
 if p_consent is distinct from true or p_rate_key !~ '^[a-f0-9]{64}$' or jsonb_typeof(p_answers)<>'object' then raise exception 'halo_invalid_input'; end if;
 insert into public.halo_intake_limits(rate_key,window_start,attempts) values(p_rate_key,now(),1)
 on conflict(rate_key) do update set
 attempts=case when halo_intake_limits.window_start<now()-interval '1 hour' then 1 else halo_intake_limits.attempts+1 end,
 window_start=case when halo_intake_limits.window_start<now()-interval '1 hour' then now() else halo_intake_limits.window_start end
 returning attempts into n;
 if n>8 then raise exception 'halo_rate_limited'; end if;
 insert into public.halo_leads(kind,locale,name,email,whatsapp,summary,answers,consent)
 values(p_kind,p_locale,p_name,p_email,p_whatsapp,p_summary,p_answers,p_consent) returning id into new_id;
 if p_kind='product_interest' then
  if coalesce(p_answers->>'productId','')='' then raise exception 'halo_invalid_input'; end if;
  insert into public.halo_product_interest(lead_id,email,product_id,consent) values(new_id,p_email,p_answers->>'productId',p_consent);
 end if;
 return new_id;
end $$;
revoke all on function public.halo_submit_lead(text,text,text,text,text,text,jsonb,boolean,text) from public,anon,authenticated;
grant execute on function public.halo_submit_lead(text,text,text,text,text,text,jsonb,boolean,text) to service_role;
create or replace function public.halo_lead_counts() returns table(kind text,status text,total bigint)
language plpgsql stable security definer set search_path=public
as $$ begin
 if not public.halo_is_admin() then raise exception 'halo_unauthorized'; end if;
 return query select l.kind,l.status,count(*) from public.halo_leads l group by l.kind,l.status;
end $$;
revoke all on function public.halo_lead_counts() from public,anon;
grant execute on function public.halo_lead_counts() to authenticated;
create or replace function public.halo_admin_update_lead(p_id uuid,p_status text,p_note text) returns void
language plpgsql security definer set search_path=public
as $$ begin
 if not public.halo_is_admin() then raise exception 'halo_unauthorized'; end if;
 if not exists(select 1 from public.halo_leads where id=p_id) then raise exception 'halo_not_found'; end if;
 if p_status is not null then
  if p_status not in ('new','contacted','waiting','in_progress','completed','closed') then raise exception 'halo_invalid_status'; end if;
  update public.halo_leads set status=p_status,updated_at=now() where id=p_id;
 end if;
 if p_note is not null then
  if char_length(trim(p_note)) not between 1 and 3000 then raise exception 'halo_invalid_note'; end if;
  insert into public.halo_lead_notes(lead_id,author_id,body) values(p_id,auth.uid(),trim(p_note));
 end if;
end $$;
revoke all on function public.halo_admin_update_lead(uuid,text,text) from public,anon;
grant execute on function public.halo_admin_update_lead(uuid,text,text) to authenticated;
commit;

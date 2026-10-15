-- Member data is private by default. Browsing is through bounded, safe projections.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table public.account_security (
 user_id uuid primary key references auth.users on delete cascade,
 status text not null default 'active' check(status in ('active','suspended')),
 adult_confirmed_at timestamptz not null default now()
);
create function private.register_account() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if coalesce((new.raw_user_meta_data->>'adult_confirmed')::boolean,false) is not true then raise exception 'Adult confirmation required'; end if;
 insert into public.account_security(user_id) values(new.id); return new;
end $$;
create trigger account_registered after insert on auth.users for each row execute function private.register_account();
create table public.countries (code text primary key, labels jsonb not null, active boolean not null default true);
create table public.purposes (code text primary key, labels jsonb not null, active boolean not null default true);
create table public.languages (code text primary key, labels jsonb not null, active boolean not null default true);
create table public.interests (code text primary key, labels jsonb not null, active boolean not null default true);
insert into public.countries values ('TR','{"en":"Türkiye","tr":"Türkiye","id":"Türkiye"}',true),('ID','{"en":"Indonesia","tr":"Endonezya","id":"Indonesia"}',true);
insert into public.purposes(code,labels) values
('serious','{"en":"Serious relationship","tr":"Ciddi ilişki","id":"Hubungan serius"}'),('marriage','{"en":"Marriage","tr":"Evlilik","id":"Pernikahan"}'),('friendship','{"en":"Friendship","tr":"Arkadaşlık","id":"Persahabatan"}'),('language','{"en":"Language exchange","tr":"Dil değişimi","id":"Pertukaran bahasa"}'),('culture','{"en":"Cultural exchange","tr":"Kültürel paylaşım","id":"Pertukaran budaya"}');
insert into public.languages(code,labels) values ('tr','{"en":"Turkish","tr":"Türkçe","id":"Bahasa Turki"}'),('id','{"en":"Bahasa Indonesia","tr":"Endonezce","id":"Bahasa Indonesia"}'),('en','{"en":"English","tr":"İngilizce","id":"Bahasa Inggris"}');
insert into public.interests(code,labels) values
('travel','{"en":"Travel","tr":"Seyahat","id":"Perjalanan"}'),('food','{"en":"Food","tr":"Yemek","id":"Kuliner"}'),('family','{"en":"Family","tr":"Aile","id":"Keluarga"}'),('culture','{"en":"Culture","tr":"Kültür","id":"Budaya"}'),('languages','{"en":"Language learning","tr":"Dil öğrenimi","id":"Belajar bahasa"}'),('movies','{"en":"Movies","tr":"Sinema","id":"Film"}'),('music','{"en":"Music","tr":"Müzik","id":"Musik"}'),('books','{"en":"Books","tr":"Kitaplar","id":"Buku"}'),('sports','{"en":"Sports","tr":"Spor","id":"Olahraga"}'),('business','{"en":"Business","tr":"İş dünyası","id":"Bisnis"}'),('technology','{"en":"Technology","tr":"Teknoloji","id":"Teknologi"}'),('nature','{"en":"Nature","tr":"Doğa","id":"Alam"}'),('photography','{"en":"Photography","tr":"Fotoğrafçılık","id":"Fotografi"}');
create table public.profiles (
 user_id uuid primary key references auth.users on delete cascade,
 public_id uuid unique not null default gen_random_uuid(),
 display_name text not null check(char_length(display_name) between 2 and 60),
 date_of_birth date not null,
 gender text not null check(gender in ('woman','man','nonbinary','undisclosed')),
 country text not null references public.countries,
 city text not null check(char_length(city) between 1 and 80),
 biography text not null default '' check(char_length(biography)<=1000),
 discoverable boolean not null default true,
 safety_acknowledged_at timestamptz,
 completed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(date_of_birth <= (current_date - interval '18 years')::date),
 check(date_of_birth >= date '1900-01-01')
);
create table public.user_purposes(user_id uuid references public.profiles on delete cascade, code text references public.purposes, primary key(user_id,code));
create table public.user_languages(user_id uuid references public.profiles on delete cascade, code text references public.languages, kind text check(kind in ('speak','learn')), primary key(user_id,code,kind));
create table public.user_interests(user_id uuid references public.profiles on delete cascade, code text references public.interests, primary key(user_id,code));
create table public.profile_photos (
 id uuid primary key default gen_random_uuid(), user_id uuid not null unique references public.profiles on delete cascade,
 storage_path text not null unique, created_at timestamptz not null default now(),
 check(storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.webp$'), check(split_part(storage_path,'/',1)=user_id::text)
);
create table public.likes(sender uuid references public.profiles on delete cascade, recipient uuid references public.profiles on delete cascade, created_at timestamptz not null default now(), primary key(sender,recipient), check(sender<>recipient));
create table public.matches(id uuid primary key default gen_random_uuid(), user_low uuid not null references public.profiles on delete cascade, user_high uuid not null references public.profiles on delete cascade, created_at timestamptz not null default now(), unique(user_low,user_high), check(user_low<user_high));
create table public.blocks(actor uuid references public.profiles on delete cascade, target uuid references public.profiles on delete cascade, created_at timestamptz not null default now(), primary key(actor,target), check(actor<>target));
create table public.reports(id uuid primary key default gen_random_uuid(), reporter uuid not null references public.profiles on delete cascade, target uuid not null references public.profiles on delete cascade, category text not null check(category in ('fake','scam','harassment','content','impersonation','underage','spam','other')), notes text not null default '' check(char_length(notes)<=1500), status text not null default 'pending' check(status in ('pending','reviewed')), created_at timestamptz not null default now(), check(reporter<>target));
create index profiles_discovery on public.profiles(country,created_at,public_id) where discoverable and completed_at is not null;
create index purposes_filter on public.user_purposes(code,user_id);
create index languages_filter on public.user_languages(code,user_id);
create index interests_filter on public.user_interests(code,user_id);
create index likes_recipient on public.likes(recipient,sender);
create index blocks_target on public.blocks(target,actor);
create index matches_high on public.matches(user_high,created_at);
create index matches_low on public.matches(user_low,created_at);
create index reports_queue on public.reports(status,created_at);
create index reports_target on public.reports(target);
create index reports_reporter on public.reports(reporter,created_at);
create function private.active_user() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.account_security s join auth.users u on u.id=s.user_id where s.user_id=auth.uid() and s.status='active' and u.email_confirmed_at is not null)
$$;
create function private.blocked(a uuid,b uuid) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.blocks where (actor=a and target=b) or (actor=b and target=a)) $$;
create function private.ready_user() returns boolean language sql stable security definer set search_path='' as $$ select private.active_user() and exists(select 1 from public.profiles where user_id=auth.uid() and completed_at is not null) $$;
create function private.visible(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.active_user() and (target=auth.uid() or (private.ready_user() and not private.blocked(auth.uid(),target) and exists(select 1 from public.profiles p join public.account_security s on s.user_id=p.user_id where p.user_id=target and s.status='active' and p.completed_at is not null and (p.discoverable or exists(select 1 from public.matches m where m.user_low=least(auth.uid(),target) and m.user_high=greatest(auth.uid(),target))))))
$$;
-- All direct writes are denied. Mutations below bind identity to auth.uid().
do $$ declare t text; begin
 foreach t in array array['account_security','profiles','profile_photos','user_purposes','user_languages','user_interests','likes','matches','blocks','reports','countries','purposes','languages','interests'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 end loop;
end $$;
grant usage on schema private to authenticated;
grant select on public.profiles,public.profile_photos,public.user_purposes,public.user_languages,public.user_interests,public.likes,public.matches,public.blocks,public.reports,public.countries,public.purposes,public.languages,public.interests to authenticated;
create policy own_profile on public.profiles for select to authenticated using(user_id=auth.uid() and private.active_user());
create policy photo_read on public.profile_photos for select to authenticated using(user_id=auth.uid() and private.active_user());
create policy own_purposes on public.user_purposes for select to authenticated using(user_id=auth.uid() and private.active_user());
create policy own_languages on public.user_languages for select to authenticated using(user_id=auth.uid() and private.active_user());
create policy own_interests on public.user_interests for select to authenticated using(user_id=auth.uid() and private.active_user());
create policy own_likes on public.likes for select to authenticated using(sender=auth.uid() and private.ready_user() and not private.blocked(sender,recipient));
create policy own_matches on public.matches for select to authenticated using(auth.uid() in (user_low,user_high) and private.ready_user() and not private.blocked(user_low,user_high));
create policy own_blocks on public.blocks for select to authenticated using(actor=auth.uid() and private.active_user());
create policy own_reports on public.reports for select to authenticated using(reporter=auth.uid() and private.active_user());
create policy countries_read on public.countries for select to authenticated using(active and private.active_user());
create policy purposes_read on public.purposes for select to authenticated using(active and private.active_user());
create policy languages_read on public.languages for select to authenticated using(active and private.active_user());
create policy interests_read on public.interests for select to authenticated using(active and private.active_user());

-- Database-backed per-account rate limits; not writable/readable by clients.
create table private.rate_limits(user_id uuid not null references auth.users on delete cascade, action text not null, window_start timestamptz not null, count integer not null, primary key(user_id,action));
create function private.throttle(action_name text, maximum integer) returns void language plpgsql security definer set search_path='' as $$
declare n integer; begin
 insert into private.rate_limits values(auth.uid(),action_name,date_trunc('hour',now()),1)
 on conflict(user_id,action) do update set count=case when private.rate_limits.window_start=excluded.window_start then private.rate_limits.count+1 else 1 end, window_start=excluded.window_start returning count into n;
 if n>maximum then raise exception 'Rate limit' using errcode='P0001'; end if;
end $$;
create function public.save_profile(payload jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); pid uuid; begin
 if not private.active_user() then raise exception 'Unauthorized'; end if;
 perform private.throttle('profile',60);
 if jsonb_typeof(payload->'purposes') is distinct from 'array' or jsonb_typeof(payload->'speaks') is distinct from 'array' or jsonb_typeof(payload->'learns') is distinct from 'array' or jsonb_typeof(payload->'interests') is distinct from 'array' then raise exception 'Invalid selections'; end if;
 if jsonb_array_length(payload->'purposes') not between 1 and 5 or jsonb_array_length(payload->'speaks') not between 1 and 15 or jsonb_array_length(payload->'learns')>15 or jsonb_array_length(payload->'interests') not between 1 and 20 then raise exception 'Invalid selections'; end if;
 if char_length(trim(payload->>'biography')) not between 20 and 1000 then raise exception 'Invalid biography'; end if;
 if not exists(select 1 from public.countries where code=payload->>'country' and active) then raise exception 'Invalid country'; end if;
 if exists(select 1 from jsonb_array_elements_text(payload->'purposes') x where not exists(select 1 from public.purposes where code=x and active)) or exists(select 1 from jsonb_array_elements_text(payload->'speaks') x where not exists(select 1 from public.languages where code=x and active)) or exists(select 1 from jsonb_array_elements_text(payload->'learns') x where not exists(select 1 from public.languages where code=x and active)) or exists(select 1 from jsonb_array_elements_text(payload->'interests') x where not exists(select 1 from public.interests where code=x and active)) then raise exception 'Invalid selections'; end if;
 insert into public.profiles(user_id,display_name,date_of_birth,gender,country,city,biography,discoverable)
 values(me,trim(payload->>'display_name'),(payload->>'date_of_birth')::date,payload->>'gender',payload->>'country',trim(payload->>'city'),trim(payload->>'biography'),coalesce((payload->>'discoverable')::boolean,true))
 on conflict(user_id) do update set display_name=excluded.display_name,date_of_birth=excluded.date_of_birth,gender=excluded.gender,country=excluded.country,city=excluded.city,biography=excluded.biography,discoverable=excluded.discoverable,updated_at=now() returning public_id into pid;
 delete from public.user_purposes where user_id=me; insert into public.user_purposes select me,value from jsonb_array_elements_text(payload->'purposes') on conflict do nothing;
 delete from public.user_languages where user_id=me; insert into public.user_languages select me,value,'speak' from jsonb_array_elements_text(payload->'speaks') on conflict do nothing; insert into public.user_languages select me,value,'learn' from jsonb_array_elements_text(payload->'learns') on conflict do nothing;
 delete from public.user_interests where user_id=me; insert into public.user_interests select me,value from jsonb_array_elements_text(payload->'interests') on conflict do nothing;
 return pid;
end $$;
create function public.complete_onboarding() returns void language plpgsql security definer set search_path='' as $$ begin
 if not private.active_user() then raise exception 'Unauthorized'; end if;
 if not exists(select 1 from public.profiles p where p.user_id=auth.uid() and char_length(p.biography)>=20 and exists(select 1 from public.user_purposes where user_id=p.user_id) and exists(select 1 from public.user_languages where user_id=p.user_id and kind='speak') and exists(select 1 from public.user_interests where user_id=p.user_id) and exists(select 1 from public.profile_photos where user_id=p.user_id)) then raise exception 'Incomplete profile'; end if;
 update public.profiles set safety_acknowledged_at=now(),completed_at=coalesce(completed_at,now()) where user_id=auth.uid();
end $$;
-- Never returns DOB, email, auth ID, or storage keys.
create function private.member_projection(p public.profiles) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('public_id',p.public_id,'display_name',p.display_name,'age',extract(year from age(current_date,p.date_of_birth))::integer,'gender',p.gender,'country',p.country,'city',p.city,'biography',p.biography,'verification','email',
 'purposes',coalesce((select jsonb_agg(code order by code) from public.user_purposes where user_id=p.user_id),'[]'),
 'speaks',coalesce((select jsonb_agg(code order by code) from public.user_languages where user_id=p.user_id and kind='speak'),'[]'),
 'learns',coalesce((select jsonb_agg(code order by code) from public.user_languages where user_id=p.user_id and kind='learn'),'[]'),
 'interests',coalesce((select jsonb_agg(code order by code) from public.user_interests where user_id=p.user_id),'[]'),
 'photo_id',(select id from public.profile_photos where user_id=p.user_id),
 'interested',exists(select 1 from public.likes where sender=auth.uid() and recipient=p.user_id))
$$;
create function public.discover_members(country_filter text default null,min_age integer default 18,max_age integer default 100,purpose_filter text default null,language_filter text default null,interest_filter text default null,after_id uuid default null) returns setof jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if not private.ready_user() then raise exception 'Unauthorized'; end if;
 if min_age<18 or max_age>125 or max_age<min_age then raise exception 'Invalid ages'; end if;
 return query select private.member_projection(p) from public.profiles p where p.user_id<>auth.uid() and p.discoverable and private.visible(p.user_id)
 and (after_id is null or p.public_id>after_id) and (country_filter is null or p.country=country_filter)
 and extract(year from age(current_date,p.date_of_birth)) between min_age and max_age
 and (purpose_filter is null or exists(select 1 from public.user_purposes where user_id=p.user_id and code=purpose_filter))
 and (language_filter is null or exists(select 1 from public.user_languages where user_id=p.user_id and code=language_filter))
 and (interest_filter is null or exists(select 1 from public.user_interests where user_id=p.user_id and code=interest_filter)) order by p.public_id limit 13;
end $$;
create function public.member_profile(profile_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$ declare p public.profiles; begin
 select * into p from public.profiles where public_id=profile_id;
 if p.user_id is null or not private.visible(p.user_id) then return null; end if;
 return private.member_projection(p);
end $$;
create function public.express_interest(profile_id uuid) returns boolean language plpgsql security definer set search_path='' as $$ declare target_id uuid; a uuid; b uuid; begin
 if not private.ready_user() then raise exception 'Unauthorized'; end if;
 select user_id into target_id from public.profiles where public_id=profile_id;
 if target_id is null or target_id=auth.uid() then raise exception 'Unavailable'; end if;
 a:=least(auth.uid(),target_id); b:=greatest(auth.uid(),target_id);
 perform pg_advisory_xact_lock(hashtextextended(a::text||b::text,0));
 if not private.visible(target_id) then raise exception 'Unavailable'; end if;
 perform private.throttle('interest',100);
 insert into public.likes(sender,recipient) values(auth.uid(),target_id) on conflict do nothing;
 if exists(select 1 from public.likes where sender=target_id and recipient=auth.uid()) then insert into public.matches(user_low,user_high) values(a,b) on conflict do nothing; return true; end if;
 return false;
end $$;
create function public.my_matches() returns setof jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if not private.ready_user() then raise exception 'Unauthorized'; end if;
 return query select private.member_projection(p)||jsonb_build_object('matched_at',m.created_at) from public.matches m join public.profiles p on p.user_id=case when m.user_low=auth.uid() then m.user_high else m.user_low end where auth.uid() in (m.user_low,m.user_high) and private.visible(p.user_id) order by m.created_at desc limit 100;
end $$;
create function public.block_member(profile_id uuid,remove_block boolean default false) returns void language plpgsql security definer set search_path='' as $$ declare t uuid; a uuid; b uuid; begin
 if not private.active_user() then raise exception 'Unauthorized'; end if;
 select user_id into t from public.profiles where public_id=profile_id;
 if t is null or t=auth.uid() then raise exception 'Unavailable'; end if;
 a:=least(auth.uid(),t); b:=greatest(auth.uid(),t); perform pg_advisory_xact_lock(hashtextextended(a::text||b::text,0));
 perform private.throttle('block',100);
 if remove_block then delete from public.blocks where actor=auth.uid() and target=t;
 else insert into public.blocks values(auth.uid(),t,now()) on conflict do nothing;
 delete from public.likes where (sender=a and recipient=b) or (sender=b and recipient=a); delete from public.matches where user_low=a and user_high=b; end if;
end $$;
create function public.my_blocks() returns table(profile_id uuid,display_name text) language sql stable security definer set search_path='' as $$ select p.public_id,p.display_name from public.blocks b join public.profiles p on p.user_id=b.target where b.actor=auth.uid() and private.active_user() order by b.created_at desc limit 100 $$;
create function public.report_profile(profile_id uuid,report_category text,report_notes text default '') returns void language plpgsql security definer set search_path='' as $$ declare t uuid; begin
 if not private.ready_user() then raise exception 'Unauthorized'; end if;
 select user_id into t from public.profiles where public_id=profile_id and completed_at is not null;
 if t is null or t=auth.uid() then raise exception 'Unavailable'; end if;
 perform private.throttle('report',10);
 insert into public.reports(reporter,target,category,notes) values(auth.uid(),t,report_category,report_notes);
end $$;
-- Storage mutations only through the validated server upload route using service role.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('profile-photos','profile-photos',false,5242880,array['image/webp']);
create policy member_photo_download on storage.objects for select to authenticated using(bucket_id='profile-photos' and exists(select 1 from public.profile_photos p where p.storage_path=name and p.user_id=auth.uid() and private.active_user()));
create function public.register_photo(owner_id uuid,object_path text) returns void language plpgsql security definer set search_path='' as $$ begin
 if not exists(select 1 from public.account_security s join auth.users u on u.id=s.user_id where s.user_id=owner_id and s.status='active' and u.email_confirmed_at is not null) then raise exception 'Unauthorized'; end if;
 insert into public.profile_photos(user_id,storage_path) values(owner_id,object_path) on conflict(user_id) do update set id=gen_random_uuid(),storage_path=excluded.storage_path,created_at=now();
end $$;
create function public.remove_photo() returns void language plpgsql security definer set search_path='' as $$ begin
 if not private.active_user() then raise exception 'Unauthorized'; end if;
 delete from public.profile_photos where user_id=auth.uid();
 update public.profiles set completed_at=null where user_id=auth.uid();
end $$;
-- Revoke PostgreSQL's default PUBLIC execute, including helper functions.
revoke all on all functions in schema private from public,anon,authenticated;
grant execute on function private.active_user(),private.ready_user(),private.blocked(uuid,uuid),private.visible(uuid) to authenticated;
revoke all on all functions in schema public from public,anon,authenticated;
grant execute on function public.save_profile(jsonb),public.complete_onboarding(),public.discover_members(text,integer,integer,text,text,text,uuid),public.member_profile(uuid),public.express_interest(uuid),public.my_matches(),public.block_member(uuid,boolean),public.my_blocks(),public.report_profile(uuid,text,text),public.remove_photo() to authenticated;
grant execute on function public.register_photo(uuid,text) to service_role;
grant all on all tables in schema public to service_role;
create function public.member_active() returns boolean language sql stable security definer set search_path='' as $$ select private.active_user() $$;
revoke all on function public.member_active() from public,anon;
grant execute on function public.member_active() to authenticated;
-- Prevent pre-existing functions from becoming executable by later migrations by default.
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema private revoke execute on functions from public;
create function public.photo_attempt() returns void language plpgsql security definer set search_path='' as $$ begin
 if not private.active_user() then raise exception 'Unauthorized'; end if;
 perform private.throttle('photo',20);
end $$;
revoke all on function public.photo_attempt() from public,anon;
grant execute on function public.photo_attempt() to authenticated;

-- Additive product experience. Existing auth, profile, messaging and storage ACLs are unchanged.
create table public.profile_context (
 user_id uuid primary key references public.profiles on delete cascade,
 nationality text references public.countries,
 relocation text check(relocation in ('yes','maybe','no')),
 future_country text references public.countries,
 education text check(char_length(education)<=100),
 profession text check(char_length(profession)<=100),
 children text check(children in ('yes','no','discuss')),
 shared boolean not null default false
);
create index profile_context_nationality on public.profile_context(nationality);
create index profile_context_future on public.profile_context(future_country);
create table public.profile_destinations (
 user_id uuid references public.profile_context on delete cascade,
 country text references public.countries, primary key(user_id,country)
);
create index profile_destinations_country on public.profile_destinations(country);
alter table public.profile_context enable row level security;
alter table public.profile_destinations enable row level security;
revoke all on public.profile_context,public.profile_destinations from public,anon,authenticated;
grant select on public.profile_context,public.profile_destinations to authenticated;
grant all on public.profile_context,public.profile_destinations to service_role;
create policy context_owner on public.profile_context for select to authenticated using(user_id=auth.uid() and private.active_user());
create policy destinations_owner on public.profile_destinations for select to authenticated using(user_id=auth.uid() and private.active_user());
create function public.save_profile_context(payload jsonb) returns void language plpgsql security definer set search_path='' as $$ begin
 if not private.active_user() then raise exception 'Unauthorized'; end if;
 perform private.throttle('profile_context',60);
 if jsonb_typeof(payload->'destinations') is distinct from 'array' or jsonb_array_length(payload->'destinations')>20 or jsonb_typeof(payload->'shared') is distinct from 'boolean' then raise exception 'Invalid choices'; end if;
 if exists(select 1 from jsonb_array_elements_text(payload->'destinations') x where not exists(select 1 from public.countries where code=x and active)) then raise exception 'Invalid country'; end if;
 if exists(select 1 from (values(nullif(payload->>'nationality','')),(nullif(payload->>'future_country',''))) v(code) where code is not null and not exists(select 1 from public.countries c where c.code=v.code and c.active)) then raise exception 'Invalid country'; end if;
 insert into public.profile_context(user_id,nationality,relocation,future_country,education,profession,children,shared)
 values(auth.uid(),nullif(payload->>'nationality',''),nullif(payload->>'relocation',''),nullif(payload->>'future_country',''),nullif(trim(payload->>'education'),''),nullif(trim(payload->>'profession'),''),nullif(payload->>'children',''),(payload->>'shared')::boolean)
 on conflict(user_id) do update set nationality=excluded.nationality,relocation=excluded.relocation,future_country=excluded.future_country,education=excluded.education,profession=excluded.profession,children=excluded.children,shared=excluded.shared;
 delete from public.profile_destinations where user_id=auth.uid();
 insert into public.profile_destinations select auth.uid(),value from jsonb_array_elements_text(payload->'destinations') on conflict do nothing;
end $$;
create function public.member_context(profile_id uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('nationality',x.nationality,'relocation',x.relocation,'future_country',x.future_country,'education',x.education,'profession',x.profession,'children',x.children,'shared',x.shared,'destinations',coalesce((select jsonb_agg(country order by country) from public.profile_destinations where user_id=x.user_id),'[]'))
 from public.profiles p join public.profile_context x on x.user_id=p.user_id
 where p.public_id=profile_id and private.visible(p.user_id) and (p.user_id=auth.uid() or x.shared)
$$;
-- Bounded, deterministic keyset discovery. Counts are ordering signals, never compatibility percentages.
create function public.search_product_members(country_filter text default null,min_age integer default 18,max_age integer default 100,purpose_filter text default null,language_filter text default null,interest_filter text default null,after_id uuid default null,name_filter text default null,view_mode text default 'for-you') returns setof jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if not private.ready_user() then raise exception 'Unauthorized'; end if;
 if min_age is null or max_age is null or min_age<18 or max_age>125 or max_age<min_age or char_length(name_filter)>60 or view_mode is null or view_mode not in ('for-you','new') then raise exception 'Invalid filters'; end if;
 return query with ranked as (
 select p.*, case when view_mode='new' then 0 else
 (select count(*)::integer from public.user_purposes x join public.user_purposes y on y.code=x.code and y.user_id=auth.uid() where x.user_id=p.user_id)+
 (select count(*)::integer from public.user_interests x join public.user_interests y on y.code=x.code and y.user_id=auth.uid() where x.user_id=p.user_id)+
 (select count(*)::integer from public.user_languages x where x.user_id=p.user_id and exists(select 1 from public.user_languages y where y.user_id=auth.uid() and y.code=x.code and (x.kind='speak' or y.kind='speak')))
 end as relevance
 from public.profiles p where p.user_id<>auth.uid() and p.discoverable and private.visible(p.user_id)
 and (country_filter is null or p.country=country_filter)
 and extract(year from age(current_date,p.date_of_birth)) between min_age and max_age
 and (name_filter is null or position(lower(trim(name_filter)) in lower(p.display_name))>0)
 and (purpose_filter is null or exists(select 1 from public.user_purposes where user_id=p.user_id and code=purpose_filter))
 and (language_filter is null or exists(select 1 from public.user_languages where user_id=p.user_id and code=language_filter))
 and (interest_filter is null or exists(select 1 from public.user_interests where user_id=p.user_id and code=interest_filter))
 ) select private.member_projection(p) from ranked r join public.profiles p on p.user_id=r.user_id
 where after_id is null or (r.relevance,r.completed_at,r.public_id)<(select a.relevance,a.completed_at,a.public_id from ranked a where a.public_id=after_id)
 order by r.relevance desc,r.completed_at desc,r.public_id desc limit 13;
end $$;
revoke all on function public.save_profile_context(jsonb),public.member_context(uuid),public.search_product_members(text,integer,integer,text,text,text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.save_profile_context(jsonb),public.member_context(uuid),public.search_product_members(text,integer,integer,text,text,text,uuid,text,text) to authenticated;

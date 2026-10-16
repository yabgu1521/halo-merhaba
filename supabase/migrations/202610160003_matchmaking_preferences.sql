-- Additive matchmaking preferences. Apply before releasing the dependent candidate UI.
-- No old migration, Auth, storage, messaging or connection policy is replaced.
create table public.matchmaking_preferences (
 user_id uuid primary key references public.profiles on delete cascade,
 min_age integer not null default 18 check(min_age between 18 and 125),
 max_age integer not null default 100 check(max_age between min_age and 125),
 purpose text references public.purposes,
 relocation text check(relocation in ('yes','maybe','no')),
 looking_for text not null default '' check(char_length(looking_for)<=600),
 share_summary boolean not null default false
);
create index matchmaking_purpose on public.matchmaking_preferences(purpose);
create table public.preferred_genders (
 user_id uuid references public.matchmaking_preferences on delete cascade,
 gender text check(gender in ('woman','man','nonbinary','undisclosed')), primary key(user_id,gender)
);
create table public.preferred_countries (
 user_id uuid references public.matchmaking_preferences on delete cascade,
 country text references public.countries, primary key(user_id,country)
);
create index preferred_countries_country on public.preferred_countries(country);
create table public.preferred_languages (
 user_id uuid references public.matchmaking_preferences on delete cascade,
 language text references public.languages, primary key(user_id,language)
);
create index preferred_languages_language on public.preferred_languages(language);
do $$ declare t text; begin
 foreach t in array array['matchmaking_preferences','preferred_genders','preferred_countries','preferred_languages'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 execute format('create policy owner_read on public.%I for select to authenticated using(user_id=auth.uid() and private.active_user())',t);
 end loop;
end $$;
alter table public.member_preferences add column advanced jsonb not null default '{}'::jsonb;
create function private.matchmaking_projection(owner_id uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('min_age',m.min_age,'max_age',m.max_age,'purpose',coalesce(m.purpose,''),'relocation',coalesce(m.relocation,''),'looking_for',m.looking_for,'share_summary',m.share_summary,
 'genders',coalesce((select jsonb_agg(gender order by gender) from public.preferred_genders where user_id=m.user_id),'[]'),
 'countries',coalesce((select jsonb_agg(country order by country) from public.preferred_countries where user_id=m.user_id),'[]'),
 'languages',coalesce((select jsonb_agg(language order by language) from public.preferred_languages where user_id=m.user_id),'[]'))
 from public.matchmaking_preferences m where m.user_id=owner_id
$$;
create function public.my_matchmaking_preferences() returns jsonb language sql stable security definer set search_path='' as $$
 select private.matchmaking_projection(auth.uid()) where private.active_user()
$$;
create function public.member_looking_for(profile_id uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select private.matchmaking_projection(p.user_id) from public.profiles p join public.matchmaking_preferences m on m.user_id=p.user_id
 where p.public_id=profile_id and private.visible(p.user_id) and (p.user_id=auth.uid() or m.share_summary)
$$;
create function public.save_matchmaking_preferences(payload jsonb) returns void language plpgsql security definer set search_path='' as $$ begin
 if not private.active_user() then raise exception 'Unauthorized'; end if;
 perform private.throttle('matchmaking_preferences',60);
 if jsonb_typeof(payload->'genders') is distinct from 'array' or jsonb_typeof(payload->'countries') is distinct from 'array' or jsonb_typeof(payload->'languages') is distinct from 'array' or jsonb_typeof(payload->'share_summary') is distinct from 'boolean' or jsonb_typeof(payload->'looking_for') is distinct from 'string' or jsonb_typeof(payload->'min_age') is distinct from 'number' or jsonb_typeof(payload->'max_age') is distinct from 'number' then raise exception 'Invalid preferences'; end if;
 if jsonb_array_length(payload->'genders')>4 or jsonb_array_length(payload->'countries')>20 or jsonb_array_length(payload->'languages')>20 then raise exception 'Invalid preferences'; end if;
 if exists(select 1 from jsonb_array_elements_text(payload->'genders') x where x not in ('woman','man','nonbinary','undisclosed')) then raise exception 'Invalid gender'; end if;
 if exists(select 1 from jsonb_array_elements_text(payload->'countries') x where not exists(select 1 from public.countries c where c.code=x and c.active)) or exists(select 1 from jsonb_array_elements_text(payload->'languages') x where not exists(select 1 from public.languages l where l.code=x and l.active)) then raise exception 'Invalid selection'; end if;
 if nullif(payload->>'purpose','') is not null and not exists(select 1 from public.purposes where code=payload->>'purpose' and active) then raise exception 'Invalid intention'; end if;
 insert into public.matchmaking_preferences(user_id,min_age,max_age,purpose,relocation,looking_for,share_summary)
 values(auth.uid(),(payload->>'min_age')::integer,(payload->>'max_age')::integer,nullif(payload->>'purpose',''),nullif(payload->>'relocation',''),trim(payload->>'looking_for'),(payload->>'share_summary')::boolean)
 on conflict(user_id) do update set min_age=excluded.min_age,max_age=excluded.max_age,purpose=excluded.purpose,relocation=excluded.relocation,looking_for=excluded.looking_for,share_summary=excluded.share_summary;
 delete from public.preferred_genders where user_id=auth.uid();insert into public.preferred_genders select auth.uid(),value from jsonb_array_elements_text(payload->'genders') on conflict do nothing;
 delete from public.preferred_countries where user_id=auth.uid();insert into public.preferred_countries select auth.uid(),value from jsonb_array_elements_text(payload->'countries') on conflict do nothing;
 delete from public.preferred_languages where user_id=auth.uid();insert into public.preferred_languages select auth.uid(),value from jsonb_array_elements_text(payload->'languages') on conflict do nothing;
end $$;
create function private.validate_candidate_filters(f jsonb) returns void language plpgsql stable security definer set search_path='' as $$
declare key text; begin
 if jsonb_typeof(f) is distinct from 'object' then raise exception 'Invalid filters'; end if;
 for key in select jsonb_object_keys(f) loop
 if key not in ('gender','country','city','nationality','purpose','language','interest','education','profession','relocation','future_country','children','name','min_age','max_age','with_photo') then raise exception 'Unknown filter'; end if;
 if key not in ('min_age','max_age','with_photo') and (jsonb_typeof(f->key) is distinct from 'string' or char_length(f->>key)>100) then raise exception 'Invalid filter'; end if;
 end loop;
 if (f ? 'min_age' and (jsonb_typeof(f->'min_age') is distinct from 'number')) or (f ? 'max_age' and (jsonb_typeof(f->'max_age') is distinct from 'number')) then raise exception 'Invalid ages'; end if;
 if coalesce((f->>'min_age')::integer,18)<18 or coalesce((f->>'max_age')::integer,125)>125 or coalesce((f->>'max_age')::integer,125)<coalesce((f->>'min_age')::integer,18) then raise exception 'Invalid ages'; end if;
 if f ? 'with_photo' and jsonb_typeof(f->'with_photo') is distinct from 'boolean' then raise exception 'Invalid photo filter'; end if;
 if coalesce(f->>'gender','') not in ('','woman','man','nonbinary','undisclosed') or coalesce(f->>'relocation','') not in ('','yes','maybe','no') or coalesce(f->>'children','') not in ('','yes','no','discuss') then raise exception 'Invalid choice'; end if;
 foreach key in array array['country','nationality','future_country'] loop
 if coalesce(f->>key,'')<>'' and not exists(select 1 from public.countries c where c.code=f->>key and c.active) then raise exception 'Invalid country'; end if;
 end loop;
 if coalesce(f->>'purpose','')<>'' and not exists(select 1 from public.purposes where code=f->>'purpose' and active) then raise exception 'Invalid intention'; end if;
 if coalesce(f->>'language','')<>'' and not exists(select 1 from public.languages where code=f->>'language' and active) then raise exception 'Invalid language'; end if;
 if coalesce(f->>'interest','')<>'' and not exists(select 1 from public.interests where code=f->>'interest' and active) then raise exception 'Invalid interest'; end if;
end $$;
create function public.save_candidate_search(filters jsonb) returns void language plpgsql security definer set search_path='' as $$ begin
 if not private.ready_user() then raise exception 'Unauthorized'; end if;
 perform private.validate_candidate_filters(filters);
 perform public.save_preferences(jsonb_build_object('country',coalesce(filters->>'country',''),'min_age',coalesce((filters->>'min_age')::integer,18),'max_age',coalesce((filters->>'max_age')::integer,125),'purpose',coalesce(filters->>'purpose',''),'language',coalesce(filters->>'language',''),'interest',coalesce(filters->>'interest','')));
 update public.member_preferences set advanced=filters where user_id=auth.uid();
end $$;
create function private.preference_accepts(p public.profiles) returns boolean language sql stable security definer set search_path='' as $$
 select not exists(select 1 from public.matchmaking_preferences m where m.user_id=auth.uid() and (
 extract(year from age(current_date,p.date_of_birth)) not between m.min_age and m.max_age
 or (exists(select 1 from public.preferred_genders where user_id=m.user_id) and not exists(select 1 from public.preferred_genders where user_id=m.user_id and gender=p.gender))
 or (exists(select 1 from public.preferred_countries where user_id=m.user_id) and not exists(select 1 from public.preferred_countries where user_id=m.user_id and country=p.country))
 or (m.purpose is not null and not exists(select 1 from public.user_purposes where user_id=p.user_id and code=m.purpose))
 or (exists(select 1 from public.preferred_languages where user_id=m.user_id) and not exists(select 1 from public.preferred_languages a join public.user_languages b on b.code=a.language and b.kind='speak' where a.user_id=m.user_id and b.user_id=p.user_id))
 or (m.relocation is not null and not exists(select 1 from public.profile_context where user_id=p.user_id and shared and relocation=m.relocation))
 ))
$$;
create function private.candidate_projection(p public.profiles) returns jsonb language sql stable security definer set search_path='' as $$
 select private.member_projection(p)||jsonb_build_object('context',public.member_context(p.public_id),'looking_for',public.member_looking_for(p.public_id),'has_match',exists(select 1 from public.matches where user_low=least(auth.uid(),p.user_id) and user_high=greatest(auth.uid(),p.user_id)))
$$;
create function public.candidate_profile(profile_id uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select private.candidate_projection(p) from public.profiles p where p.public_id=profile_id and private.visible(p.user_id)
$$;
create function public.find_candidates(filters jsonb default '{}'::jsonb,view_mode text default 'for-you',after_id uuid default null) returns setof jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if not private.ready_user() then raise exception 'Unauthorized'; end if;
 perform private.validate_candidate_filters(filters);
 if view_mode is null or view_mode not in ('for-you','new','discover','search') then raise exception 'Invalid mode'; end if;
 return query with ranked as (
 select p.*,case when view_mode='for-you' then
 (select count(*)::integer from public.user_purposes a join public.user_purposes b on a.code=b.code and b.user_id=auth.uid() where a.user_id=p.user_id)+
 (select count(*)::integer from public.user_interests a join public.user_interests b on a.code=b.code and b.user_id=auth.uid() where a.user_id=p.user_id)+
 (select count(*)::integer from public.user_languages a where a.user_id=p.user_id and exists(select 1 from public.user_languages b where b.user_id=auth.uid() and b.code=a.code and (a.kind='speak' or b.kind='speak')))+
 (select count(*)::integer from public.profile_context a join public.profile_context b on b.user_id=auth.uid() and b.shared where a.user_id=p.user_id and a.shared and a.relocation='yes' and b.relocation='yes')
 else 0 end as relevance
 from public.profiles p left join public.profile_context x on x.user_id=p.user_id and x.shared
 where p.user_id<>auth.uid() and p.discoverable and private.visible(p.user_id) and private.preference_accepts(p)
 and extract(year from age(current_date,p.date_of_birth)) between coalesce((filters->>'min_age')::integer,18) and coalesce((filters->>'max_age')::integer,125)
 and (coalesce(filters->>'gender','')='' or p.gender=filters->>'gender')
 and (coalesce(filters->>'country','')='' or p.country=filters->>'country')
 and (coalesce(filters->>'city','')='' or position(lower(filters->>'city') in lower(p.city))>0)
 and (coalesce(filters->>'name','')='' or position(lower(filters->>'name') in lower(p.display_name))>0)
 and (coalesce(filters->>'purpose','')='' or exists(select 1 from public.user_purposes where user_id=p.user_id and code=filters->>'purpose'))
 and (coalesce(filters->>'language','')='' or exists(select 1 from public.user_languages where user_id=p.user_id and kind='speak' and code=filters->>'language'))
 and (coalesce(filters->>'interest','')='' or exists(select 1 from public.user_interests where user_id=p.user_id and code=filters->>'interest'))
 and (not coalesce((filters->>'with_photo')::boolean,false) or exists(select 1 from public.profile_photos where user_id=p.user_id))
 and (coalesce(filters->>'nationality','')='' or x.nationality=filters->>'nationality')
 and (coalesce(filters->>'relocation','')='' or x.relocation=filters->>'relocation')
 and (coalesce(filters->>'future_country','')='' or x.future_country=filters->>'future_country')
 and (coalesce(filters->>'children','')='' or x.children=filters->>'children')
 and (coalesce(filters->>'education','')='' or position(lower(filters->>'education') in lower(x.education))>0)
 and (coalesce(filters->>'profession','')='' or position(lower(filters->>'profession') in lower(x.profession))>0)
 ) select private.candidate_projection(p) from ranked r join public.profiles p on p.user_id=r.user_id
 where after_id is null or (r.relevance,r.completed_at,r.public_id)<(select a.relevance,a.completed_at,a.public_id from ranked a where a.public_id=after_id)
 order by r.relevance desc,r.completed_at desc,r.public_id desc limit 13;
end $$;
create function public.my_interests(after_id uuid default null) returns setof jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if not private.ready_user() then raise exception 'Unauthorized'; end if;
 return query select private.candidate_projection(p) from public.likes l join public.profiles p on p.user_id=l.recipient
 where l.sender=auth.uid() and private.visible(p.user_id) and (after_id is null or p.public_id<after_id) order by p.public_id desc limit 13;
end $$;
revoke all on function private.matchmaking_projection(uuid),private.validate_candidate_filters(jsonb),private.preference_accepts(public.profiles),private.candidate_projection(public.profiles) from public,anon,authenticated;
revoke all on function public.my_matchmaking_preferences(),public.member_looking_for(uuid),public.save_matchmaking_preferences(jsonb),public.save_candidate_search(jsonb),public.candidate_profile(uuid),public.find_candidates(jsonb,text,uuid),public.my_interests(uuid) from public,anon,authenticated;
grant execute on function public.my_matchmaking_preferences(),public.member_looking_for(uuid),public.save_matchmaking_preferences(jsonb),public.save_candidate_search(jsonb),public.candidate_profile(uuid),public.find_candidates(jsonb,text,uuid),public.my_interests(uuid) to authenticated;

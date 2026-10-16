-- Additive member features. No resets, backfills, unrelated ACL changes or customer-data deletes.
create table public.favorites (
 actor uuid not null references public.profiles on delete cascade,
 target uuid not null references public.profiles on delete cascade,
 created_at timestamptz not null default now(), primary key(actor,target), check(actor<>target)
);
create index favorites_target on public.favorites(target);
create table public.member_preferences (
 user_id uuid primary key references public.profiles on delete cascade,
 country text references public.countries, min_age integer not null default 18,
 max_age integer not null default 100, purpose text references public.purposes,
 language text references public.languages, interest text references public.interests,
 check(min_age between 18 and 125),check(max_age between min_age and 125)
);
create table public.conversations (
 id uuid primary key default gen_random_uuid(),
 match_id uuid unique references public.matches on delete set null,
 user_low uuid not null references public.profiles on delete cascade,
 user_high uuid not null references public.profiles on delete cascade,
 created_at timestamptz not null default now(), check(user_low<user_high)
);
create index conversations_low on public.conversations(user_low,created_at,id);
create index conversations_high on public.conversations(user_high,created_at,id);
create table public.messages (
 id bigint generated always as identity primary key,
 conversation_id uuid not null references public.conversations on delete cascade,
 sender uuid not null references public.profiles on delete cascade,
 body text not null check(char_length(trim(body)) between 1 and 2000),
 client_id uuid not null, created_at timestamptz not null default now(),
 unique(sender,client_id)
);
create index messages_thread on public.messages(conversation_id,id desc);
create index messages_sender on public.messages(sender);
create table public.conversation_reads (
 conversation_id uuid not null references public.conversations on delete cascade,
 user_id uuid not null references public.profiles on delete cascade,
 last_read_id bigint not null default 0, primary key(conversation_id,user_id)
);
create index conversation_reads_user on public.conversation_reads(user_id);
create function private.can_message(conversation uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.ready_user() and exists(
 select 1 from public.conversations c join public.matches m on m.id=c.match_id
 where c.id=conversation and auth.uid() in(c.user_low,c.user_high)
 and m.user_low=c.user_low and m.user_high=c.user_high
 and not private.blocked(c.user_low,c.user_high)
 and exists(select 1 from public.account_security where user_id=c.user_low and status='active')
 and exists(select 1 from public.account_security where user_id=c.user_high and status='active')
 and exists(select 1 from public.profiles where user_id=c.user_low and completed_at is not null)
 and exists(select 1 from public.profiles where user_id=c.user_high and completed_at is not null))
$$;
alter table public.favorites enable row level security;
alter table public.member_preferences enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.conversation_reads enable row level security;
revoke all on public.favorites,public.member_preferences,public.conversations,public.messages,public.conversation_reads from public,anon,authenticated;
grant select on public.favorites,public.member_preferences,public.conversations,public.messages,public.conversation_reads to authenticated;
create policy favorites_owner on public.favorites for select to authenticated using(actor=auth.uid() and private.ready_user() and private.visible(target));
create policy preferences_owner on public.member_preferences for select to authenticated using(user_id=auth.uid() and private.active_user());
create policy conversations_participant on public.conversations for select to authenticated using(private.can_message(id));
create policy messages_participant on public.messages for select to authenticated using(private.can_message(conversation_id));
create policy reads_owner on public.conversation_reads for select to authenticated using(user_id=auth.uid() and private.can_message(conversation_id));
create function public.save_preferences(selection jsonb) returns void language plpgsql security definer set search_path='' as $$ begin
 if not private.ready_user() then raise exception 'Unauthorized'; end if;
 perform private.throttle('preferences',60);
 insert into public.member_preferences(user_id,country,min_age,max_age,purpose,language,interest)
 values(auth.uid(),nullif(selection->>'country',''),(selection->>'min_age')::integer,(selection->>'max_age')::integer,nullif(selection->>'purpose',''),nullif(selection->>'language',''),nullif(selection->>'interest',''))
 on conflict(user_id) do update set country=excluded.country,min_age=excluded.min_age,max_age=excluded.max_age,purpose=excluded.purpose,language=excluded.language,interest=excluded.interest;
end $$;
create function public.set_favorite(profile_id uuid,saved boolean) returns void language plpgsql security definer set search_path='' as $$ declare target_id uuid; begin
 if not private.ready_user() then raise exception 'Unauthorized'; end if;
 select user_id into target_id from public.profiles where public_id=profile_id;
 if target_id is null or target_id=auth.uid() then raise exception 'Unavailable'; end if;
 perform pg_advisory_xact_lock(hashtextextended(least(auth.uid(),target_id)::text||greatest(auth.uid(),target_id)::text,0));
 if not private.visible(target_id) then raise exception 'Unavailable'; end if;
 perform private.throttle('favorite',100);
 if saved then insert into public.favorites(actor,target) values(auth.uid(),target_id) on conflict do nothing;
 else delete from public.favorites where actor=auth.uid() and target=target_id; end if;
end $$;
create function public.favorite_members(after_id uuid default null) returns setof jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if not private.ready_user() then raise exception 'Unauthorized'; end if;
 return query select private.member_projection(p) from public.favorites f join public.profiles p on p.user_id=f.target
 where f.actor=auth.uid() and private.visible(p.user_id) and (after_id is null or p.public_id>after_id) order by p.public_id limit 13;
end $$;
create function private.clean_blocked_favorites() returns trigger language plpgsql security definer set search_path='' as $$ begin
 delete from public.favorites where (actor=new.actor and target=new.target) or(actor=new.target and target=new.actor);return new;
end $$;
create trigger favorites_after_block after insert on public.blocks for each row execute function private.clean_blocked_favorites();
create function public.open_conversation(profile_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare t uuid; m public.matches; conversation uuid; begin
 if not private.ready_user() then raise exception 'Unauthorized'; end if;
 select user_id into t from public.profiles where public_id=profile_id;
 if t is null or t=auth.uid() then raise exception 'Unavailable'; end if;
 perform pg_advisory_xact_lock(hashtextextended(least(auth.uid(),t)::text||greatest(auth.uid(),t)::text,0));
 select * into m from public.matches where user_low=least(auth.uid(),t) and user_high=greatest(auth.uid(),t);
 if m.id is null or not private.visible(t) then raise exception 'Unavailable'; end if;
 perform private.throttle('conversation',60);
 insert into public.conversations(match_id,user_low,user_high) values(m.id,m.user_low,m.user_high)
 on conflict(match_id) do update set match_id=excluded.match_id returning id into conversation;
 return conversation;
end $$;
create function public.send_message(conversation uuid,message_body text,request_id uuid) returns bigint language plpgsql security definer set search_path='' as $$
declare c public.conversations; result bigint; prior public.messages; begin
 select * into c from public.conversations where id=conversation;
 if c.id is null then raise exception 'Unavailable'; end if;
 perform pg_advisory_xact_lock(hashtextextended(c.user_low::text||c.user_high::text,0));
 if not private.can_message(conversation) then raise exception 'Unauthorized'; end if;
 if char_length(trim(message_body)) not between 1 and 2000 or request_id is null then raise exception 'Invalid message'; end if;
 select * into prior from public.messages where sender=auth.uid() and client_id=request_id;
 if prior.id is not null then
 if prior.conversation_id<>conversation or prior.body<>trim(message_body) then raise exception 'Invalid retry'; end if;
 return prior.id; end if;
 perform private.throttle('message',120);
 insert into public.messages(conversation_id,sender,body,client_id) values(conversation,auth.uid(),trim(message_body),request_id) returning id into result;
 return result;
end $$;
create function public.read_thread(conversation uuid,before_id bigint default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare other public.profiles; items jsonb; begin
 if not private.can_message(conversation) then raise exception 'Unauthorized'; end if;
 select p.* into other from public.conversations c join public.profiles p on p.user_id=case when c.user_low=auth.uid() then c.user_high else c.user_low end where c.id=conversation;
 select coalesce(jsonb_agg(jsonb_build_object('id',q.id::text,'body',q.body,'mine',q.sender=auth.uid(),'created_at',q.created_at) order by q.id),'[]') into items
 from(select * from public.messages where conversation_id=conversation and(before_id is null or id<before_id) order by id desc limit 50) q;
 return jsonb_build_object('member',private.member_projection(other),'messages',items);
end $$;
create function public.mark_conversation_read(conversation uuid,through_id bigint) returns void language plpgsql security definer set search_path='' as $$ begin
 if not private.can_message(conversation) then raise exception 'Unauthorized'; end if;
 if through_id is null or not exists(select 1 from public.messages where id=through_id and conversation_id=conversation) then raise exception 'Invalid message'; end if;
 insert into public.conversation_reads values(conversation,auth.uid(),through_id)
 on conflict(conversation_id,user_id) do update set last_read_id=greatest(public.conversation_reads.last_read_id,excluded.last_read_id);
end $$;
create function public.list_conversations(before_time timestamptz default null,before_id uuid default null) returns setof jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if not private.ready_user() then raise exception 'Unauthorized'; end if;
 return query select jsonb_build_object('id',c.id,'member',private.member_projection(p),'created_at',c.created_at,
 'unread',exists(select 1 from public.messages x where x.conversation_id=c.id and x.sender<>auth.uid() and x.id>coalesce((select last_read_id from public.conversation_reads where conversation_id=c.id and user_id=auth.uid()),0)))
 from public.conversations c join public.profiles p on p.user_id=case when c.user_low=auth.uid() then c.user_high else c.user_low end
 where private.can_message(c.id) and(before_time is null or(c.created_at,c.id)<(before_time,before_id)) order by c.created_at desc,c.id desc limit 21;
end $$;
revoke all on function private.can_message(uuid),private.clean_blocked_favorites() from public,anon,authenticated;
grant execute on function private.can_message(uuid) to authenticated;
revoke all on function public.save_preferences(jsonb),public.set_favorite(uuid,boolean),public.favorite_members(uuid),public.open_conversation(uuid),public.send_message(uuid,text,uuid),public.read_thread(uuid,bigint),public.mark_conversation_read(uuid,bigint),public.list_conversations(timestamptz,uuid) from public,anon,authenticated;
grant execute on function public.save_preferences(jsonb),public.set_favorite(uuid,boolean),public.favorite_members(uuid),public.open_conversation(uuid),public.send_message(uuid,text,uuid),public.read_thread(uuid,bigint),public.mark_conversation_read(uuid,bigint),public.list_conversations(timestamptz,uuid) to authenticated;
grant all on public.favorites,public.member_preferences,public.conversations,public.messages,public.conversation_reads to service_role;
grant usage,select on sequence public.messages_id_seq to service_role;

create or replace function private.member_projection(p public.profiles) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('public_id',p.public_id,'display_name',p.display_name,'age',extract(year from age(current_date,p.date_of_birth))::integer,'gender',p.gender,'country',p.country,'city',p.city,'biography',p.biography,'verification','email',
 'purposes',coalesce((select jsonb_agg(code order by code) from public.user_purposes where user_id=p.user_id),'[]'),
 'speaks',coalesce((select jsonb_agg(code order by code) from public.user_languages where user_id=p.user_id and kind='speak'),'[]'),
 'learns',coalesce((select jsonb_agg(code order by code) from public.user_languages where user_id=p.user_id and kind='learn'),'[]'),
 'interests',coalesce((select jsonb_agg(code order by code) from public.user_interests where user_id=p.user_id),'[]'),
 'photo_id',(select id from public.profile_photos where user_id=p.user_id),
 'favorited',exists(select 1 from public.favorites where actor=auth.uid() and target=p.user_id),
 'interested',exists(select 1 from public.likes where sender=auth.uid() and recipient=p.user_id))
$$;

create function public.search_members(country_filter text default null,min_age integer default 18,max_age integer default 100,purpose_filter text default null,language_filter text default null,interest_filter text default null,after_id uuid default null,name_filter text default null) returns setof jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if not private.ready_user() then raise exception 'Unauthorized'; end if;
 if char_length(name_filter)>60 then raise exception 'Invalid name'; end if;
 if min_age<18 or max_age>125 or max_age<min_age then raise exception 'Invalid ages'; end if;
 return query select private.member_projection(p) from public.profiles p where p.user_id<>auth.uid() and p.discoverable and private.visible(p.user_id)
 and (name_filter is null or position(lower(trim(name_filter)) in lower(p.display_name))>0)
 and (after_id is null or p.public_id>after_id) and (country_filter is null or p.country=country_filter)
 and extract(year from age(current_date,p.date_of_birth)) between min_age and max_age
 and (purpose_filter is null or exists(select 1 from public.user_purposes where user_id=p.user_id and code=purpose_filter))
 and (language_filter is null or exists(select 1 from public.user_languages where user_id=p.user_id and code=language_filter))
 and (interest_filter is null or exists(select 1 from public.user_interests where user_id=p.user_id and code=interest_filter)) order by p.public_id limit 13;
end $$;

revoke all on function public.search_members(text,integer,integer,text,text,text,uuid,text) from public,anon;
grant execute on function public.search_members(text,integer,integer,text,text,text,uuid,text) to authenticated;

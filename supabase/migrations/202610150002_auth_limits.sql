create table private.auth_limits(key text primary key,window_start timestamptz not null,count integer not null);
create index auth_limits_expiry on private.auth_limits(window_start);
create function public.consume_auth_attempt(bucket text,maximum integer) returns boolean language plpgsql security definer set search_path='' as $$ declare n integer; begin
 insert into private.auth_limits values(bucket,date_trunc('hour',now()),1) on conflict(key) do update set count=case when private.auth_limits.window_start=excluded.window_start then private.auth_limits.count+1 else 1 end,window_start=excluded.window_start returning count into n;
 -- Bound persistent rate-limit data; no raw addresses or email are stored.
 delete from private.auth_limits where window_start<now()-interval '2 days';
 return n<=maximum;
end $$;
revoke all on function public.consume_auth_attempt(text,integer) from public,anon,authenticated;
grant execute on function public.consume_auth_attempt(text,integer) to service_role;

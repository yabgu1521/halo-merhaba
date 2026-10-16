insert into public.halo_admin_profiles(user_id,is_active) values('11111111-1111-4111-8111-111111111111',true);
set role service_role;
select public.halo_submit_lead('consultation','id','Test Lead','lead@example.invalid','','Test inquiry only','{"topic":"test"}',true,repeat('a',64)) as lead_id \gset
select set_config('test.lead_id',:'lead_id',false);
select public.halo_submit_lead('product_interest','id','','product@example.invalid','','','{"productId":"marriage-checklist-wni"}',true,repeat('b',64));
reset role;
begin;
set local role anon;
do $$ begin
 begin perform count(*) from public.halo_leads; raise exception 'unexpected_anon_read'; exception when insufficient_privilege then null; end;
 begin perform count(*) from public.halo_product_interest; raise exception 'unexpected_anon_product_read'; exception when insufficient_privilege then null; end;
 begin perform public.halo_submit_lead('consultation','id','x','x@example.invalid','','test','{}',true,repeat('a',64)); raise exception 'unexpected_direct_submit'; exception when insufficient_privilege then null; end;
end $$;
rollback;
begin;
set local role authenticated;
set local request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
do $$ begin
 assert (select count(*) from public.halo_leads)=0,'non-admin lead enumeration';
 assert (select count(*) from public.halo_product_interest)=0,'non-admin interest enumeration';
 assert not public.halo_is_admin(),'non-admin escalation';
 begin update public.halo_admin_profiles set is_active=true; raise exception 'unexpected_role_write'; exception when insufficient_privilege then null; end;
 begin perform public.halo_admin_update_lead(current_setting('test.lead_id')::uuid,'completed','bad'); raise exception 'unexpected_nonadmin_rpc'; exception when sqlstate 'P0001' then if sqlerrm<>'halo_unauthorized' then raise; end if; end;
end $$;
rollback;
begin;
set local role authenticated;
set local request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
do $$ begin
 assert public.halo_is_admin(),'admin access';
 assert (select count(*) from public.halo_leads)=2,'admin list';
 assert (select count(*) from public.halo_product_interest)=1,'admin interest list';
 assert (select sum(total) from public.halo_lead_counts())=2,'admin counts';
 perform public.halo_admin_update_lead(current_setting('test.lead_id')::uuid,'contacted','Internal test note');
 assert (select status from public.halo_leads where id=current_setting('test.lead_id')::uuid)='contacted','status did not persist';
 assert (select count(*) from public.halo_lead_notes)=1,'note did not persist';
 assert (select author_id from public.halo_lead_notes limit 1)=auth.uid(),'note author spoof';
 begin update public.halo_leads set name='tampered'; raise exception 'unexpected_direct_update'; exception when insufficient_privilege then null; end;
end $$;
commit;
begin;
set local role authenticated;
set local request.jwt.claim.sub='22222222-2222-4222-8222-222222222222';
do $$ begin assert (select count(*) from public.halo_lead_notes)=0,'internal note leak'; end $$;
rollback;
set role service_role;
do $$ declare i integer; blocked boolean:=false; begin
 for i in 1..9 loop
  begin perform public.halo_submit_lead('course','id','Rate Test','rate@example.invalid','','test','{}',true,repeat('c',64));
  exception when sqlstate 'P0001' then if sqlerrm='halo_rate_limited' then blocked:=true; else raise; end if; end;
 end loop;
 assert blocked,'rate limit did not apply';
 assert (select count(*) from public.halo_leads where email='rate@example.invalid')=8,'rate-limit write count';
end $$;
reset role;
update public.halo_admin_profiles set is_active=false where user_id='11111111-1111-4111-8111-111111111111';
begin;
set local role authenticated;
set local request.jwt.claim.sub='11111111-1111-4111-8111-111111111111';
do $$ begin assert not public.halo_is_admin(),'deactivated admin';assert (select count(*) from public.halo_leads)=0,'deactivated admin read';end $$;
rollback;
select 'PASS: anonymous/non-admin denied; admin read/update/notes; consent-scoped interest; rate limit; revocation.';

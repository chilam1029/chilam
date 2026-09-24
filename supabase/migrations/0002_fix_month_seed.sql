-- PostgreSQL's built-in UUID generator is available under a restricted search path.
create or replace function mochi_private.ensure_user() returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid(); v_month date;
begin
 if v_user is null then raise exception 'Sign in required'; end if;
 insert into public.profiles(user_id) values(v_user) on conflict do nothing;
 v_month := date_trunc('month', now() at time zone (select timezone from public.profiles where user_id=v_user))::date;
 update public.mochis set graduated_at=now() where user_id=v_user and month_key<v_month and graduated_at is null;
 insert into public.mochis(user_id,month_key,genetics) values(v_user,v_month,jsonb_build_object('seed',replace(gen_random_uuid()::text,'-',''))) on conflict do nothing;
 insert into public.gacha_state(user_id) values(v_user) on conflict do nothing;
 return v_user;
end $$;

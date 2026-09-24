create extension if not exists pgcrypto;
create schema if not exists mochi_private;
create table public.profiles (user_id uuid primary key references auth.users(id) on delete cascade, daily_target_ml integer not null default 2000 check (daily_target_ml between 500 and 5000), timezone text not null default 'UTC', water_drops integer not null default 0 check (water_drops >= 0), created_at timestamptz not null default now());
create table public.water_logs (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, amount_ml integer not null check (amount_ml between 1 and 2000), drink_type text not null default 'water' check (drink_type in ('water','tea','other')), logged_at timestamptz not null default now(), drops_earned integer not null default 0 check (drops_earned >= 0));
create index water_logs_user_time on public.water_logs(user_id, logged_at desc);
create table public.mochis (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, month_key date not null, genetics jsonb not null, graduated_at timestamptz, unique(user_id, month_key));
create table public.cosmetics (id uuid primary key default gen_random_uuid(), name text not null, area text not null check (area in ('baby_environment','village')), rarity text not null check (rarity in ('common','uncommon','rare','special')), asset_key text not null unique);
create table public.user_cosmetics (user_id uuid not null references auth.users(id) on delete cascade, cosmetic_id uuid not null references public.cosmetics(id), quantity integer not null default 1 check (quantity > 0), acquired_at timestamptz not null default now(), primary key(user_id, cosmetic_id));
create table public.gacha_state (user_id uuid primary key references auth.users(id) on delete cascade, pulls_since_rare integer not null default 0, total_pulls bigint not null default 0);
insert into public.cosmetics(name,area,rarity,asset_key) values ('Cloud Bed','baby_environment','common','cloud-bed'),('Fish Plush','baby_environment','common','fish-plush'),('Mossy Bridge','village','common','mossy-bridge'),('Daisy Lamp','baby_environment','uncommon','daisy-lamp'),('Stone Path','village','uncommon','stone-path'),('Moon Cushion','baby_environment','rare','moon-cushion'),('Starry Fountain','village','rare','starry-fountain'),('Aurora House','village','special','aurora-house');
alter table public.profiles enable row level security;
alter table public.water_logs enable row level security;
alter table public.mochis enable row level security;
alter table public.cosmetics enable row level security;
alter table public.user_cosmetics enable row level security;
alter table public.gacha_state enable row level security;
create policy profiles_read on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy logs_read on public.water_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy mochis_read on public.mochis for select to authenticated using ((select auth.uid()) = user_id);
create policy cosmetics_read on public.cosmetics for select to authenticated using (true);
create policy inventory_read on public.user_cosmetics for select to authenticated using ((select auth.uid()) = user_id);
create policy gacha_read on public.gacha_state for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.profiles, public.water_logs, public.mochis, public.cosmetics, public.user_cosmetics, public.gacha_state from anon, authenticated;
grant select on public.profiles, public.water_logs, public.mochis, public.cosmetics, public.user_cosmetics, public.gacha_state to authenticated;
create function mochi_private.ensure_user() returns uuid language plpgsql security definer set search_path = '' as $$
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
-- Use a PL/pgSQL wrapper so the function executes exactly once and returns no private data.
create function public.bootstrap_mochi() returns void language plpgsql security invoker set search_path = '' as $$ begin perform mochi_private.ensure_user(); end $$;
create function mochi_private.log_water(p_amount integer,p_drink text) returns public.water_logs language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_profile public.profiles%rowtype; v_previous integer; v_earned integer; v_log public.water_logs;
begin
 if p_amount is null or p_amount not between 1 and 2000 or p_drink is null or p_drink not in ('water','tea','other') then raise exception 'Invalid drink'; end if;
 v_user := mochi_private.ensure_user();
 select * into v_profile from public.profiles where user_id=v_user for update;
 select coalesce(sum(amount_ml),0) into v_previous from public.water_logs where user_id=v_user and (logged_at at time zone v_profile.timezone)::date=(now() at time zone v_profile.timezone)::date;
 v_earned := floor(least(v_profile.daily_target_ml,v_previous+p_amount)/2.0)::integer-floor(least(v_profile.daily_target_ml,v_previous)/2.0)::integer;
 insert into public.water_logs(user_id,amount_ml,drink_type,drops_earned) values(v_user,p_amount,p_drink,v_earned) returning * into v_log;
 update public.profiles set water_drops=water_drops+v_earned where user_id=v_user;
 return v_log;
end $$;
create function public.log_water(p_amount integer,p_drink text default 'water') returns public.water_logs language sql security invoker set search_path = '' as $$ select mochi_private.log_water(p_amount,p_drink) $$;
create function mochi_private.draw_cosmetic() returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user uuid; v_balance integer; v_pity integer; v_roll double precision; v_rarity text; v_item public.cosmetics%rowtype; v_duplicate boolean; v_refund integer := 0;
begin
 v_user := mochi_private.ensure_user();
 select water_drops into v_balance from public.profiles where user_id=v_user for update;
 if v_balance < 300 then raise exception 'Not enough Water Drops'; end if;
 select pulls_since_rare into v_pity from public.gacha_state where user_id=v_user for update;
 v_roll := random();
 v_rarity := case when v_pity>=19 then 'rare' when v_roll<.02 then 'special' when v_roll<.12 then 'rare' when v_roll<.37 then 'uncommon' else 'common' end;
 select * into v_item from public.cosmetics where rarity=v_rarity order by random() limit 1;
 if v_item.id is null then raise exception 'Cosmetic pool unavailable'; end if;
 select exists(select 1 from public.user_cosmetics where user_id=v_user and cosmetic_id=v_item.id) into v_duplicate;
 if v_duplicate then v_refund:=90; end if;
 update public.profiles set water_drops=water_drops-300+v_refund where user_id=v_user;
 insert into public.user_cosmetics(user_id,cosmetic_id) values(v_user,v_item.id) on conflict (user_id,cosmetic_id) do update set quantity=public.user_cosmetics.quantity+1, acquired_at=now();
 update public.gacha_state set total_pulls=total_pulls+1,pulls_since_rare=case when v_rarity in ('rare','special') then 0 else pulls_since_rare+1 end where user_id=v_user;
 return jsonb_build_object('name',v_item.name,'area',v_item.area,'rarity',v_item.rarity,'duplicate',v_duplicate,'refund',v_refund);
end $$;
create function public.draw_cosmetic() returns jsonb language sql security invoker set search_path = '' as $$ select mochi_private.draw_cosmetic() $$;
revoke all on schema mochi_private from public, anon;
grant usage on schema mochi_private to authenticated;
revoke all on all functions in schema mochi_private from public, anon;
grant execute on function mochi_private.ensure_user(),mochi_private.log_water(integer,text),mochi_private.draw_cosmetic() to authenticated;
revoke all on function public.bootstrap_mochi(),public.log_water(integer,text),public.draw_cosmetic() from public, anon;
grant execute on function public.bootstrap_mochi(),public.log_water(integer,text),public.draw_cosmetic() to authenticated;

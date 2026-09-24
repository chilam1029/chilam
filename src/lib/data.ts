import { supabase } from './supabase';

export type DrinkLog = { id: string; amount_ml: number; drink_type: string; logged_at: string; drops_earned: number };
export type Resident = { id: string; month_key: string; graduated_at: string | null; genetics: { seed: string } };
export type OwnedItem = { quantity: number; acquired_at: string; cosmetics: { name: string; area: string; rarity: string } | null };
export type Snapshot = { target: number; drops: number; logs: DrinkLog[]; mochis: Resident[]; items: OwnedItem[] };

function check<T>(result: {data: T; error: {message: string} | null}): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
export async function loadSnapshot(userId: string): Promise<Snapshot> {
  check(await supabase.rpc('bootstrap_mochi'));
  const [profile, logs, mochis, items] = await Promise.all([
    supabase.from('profiles').select('daily_target_ml,water_drops').eq('user_id',userId).single(),
    supabase.from('water_logs').select('id,amount_ml,drink_type,logged_at,drops_earned').eq('user_id',userId).order('logged_at',{ascending:false}).limit(300),
    supabase.from('mochis').select('id,month_key,graduated_at,genetics').eq('user_id',userId).order('month_key',{ascending:false}),
    supabase.from('user_cosmetics').select('quantity,acquired_at,cosmetics(name,area,rarity)').eq('user_id',userId).order('acquired_at',{ascending:false}),
  ]);
  const p = check(profile);
  if (!p) throw new Error('Profile unavailable');
  return {target:p.daily_target_ml,drops:p.water_drops,logs:check(logs) as DrinkLog[],mochis:check(mochis) as Resident[],items:check(items) as unknown as OwnedItem[]};
}
export async function logWater(amount: number) {return check(await supabase.rpc('log_water',{p_amount:amount,p_drink:'water'}));}
export async function drawCosmetic() {return check(await supabase.rpc('draw_cosmetic')) as {name:string;rarity:string;area:string;duplicate:boolean;refund:number};}
export function todayIntake(logs: DrinkLog[]) {
  const today = new Date().toISOString().slice(0,10);
  return logs.filter(log => log.logged_at.slice(0,10)===today).reduce((sum,log)=>sum+log.amount_ml,0);
}
export function stageFor(): string {
  const now=new Date();
  const day=now.getDate();
  return day<=7?'Newborn':day<=14?'Baby':day<=21?'Growing':'Young';
}

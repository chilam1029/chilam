import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';

// A publishable key is safe to ship in the client. Never place a secret/service key here.
export const supabase = createClient(
  'https://keahgzlplqenuarafnlo.supabase.co',
  'sb_publishable_0Q6THgc2BcbhI8Sx_U5Asw_aaUTvGHg',
  { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true,
    detectSessionInUrl: false, lock: processLock } }
);

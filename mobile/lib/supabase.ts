// ── Supabase Client for Mobile ──────────────────────────────────
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = "https://jlkfltlqhjgaljqfnrts.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_XZhrg5VdODeejFzJiYe-GQ_i7FafNLG";

export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

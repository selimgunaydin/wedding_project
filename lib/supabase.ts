import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import ws from "ws";

let publicClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

// supabase-js'in realtime modülü Node < 22'de yerel WebSocket bulamayıp hata
// fırlatıyor. Realtime kullanmıyoruz ama createClient onu yine de başlatıyor;
// "ws" paketini transport olarak vererek bu hatayı engelliyoruz.
const realtimeOptions = { transport: ws as unknown as typeof WebSocket };

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

export function isSupabaseServiceConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabasePublicClient() {
  if (!isSupabaseConfigured()) return null;

  publicClient ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false
    },
    realtime: realtimeOptions
  });

  return publicClient;
}

export function getSupabaseServiceClient() {
  if (!isSupabaseServiceConfigured()) return null;

  serviceClient ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    realtime: realtimeOptions
  });

  return serviceClient;
}

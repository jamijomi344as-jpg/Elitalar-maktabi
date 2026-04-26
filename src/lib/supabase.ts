import { createClient } from '@supabase/supabase-js'

// Browser muhitida xavfsiz bo'lishi uchun tekshiruv
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase kalitlari topilmadi. .env yoki Render muhitini tekshiring.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

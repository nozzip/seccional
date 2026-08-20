import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://bsougkolkltztytxdbna.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseKey) {
  console.warn('⚠️ [Supabase] No se encontró SUPABASE_KEY en las variables de entorno.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export const WEB_URL = process.env.WEB_URL || 'https://aefipnoroeste.org.ar';
export const HUMAN_AGENT_PHONE = process.env.HUMAN_AGENT_PHONE || '5493870000000';

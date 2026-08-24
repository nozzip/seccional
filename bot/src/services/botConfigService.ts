import { supabase } from '../config/supabase.js';

let cachedIsActive: boolean = true;
let lastCheckTime: number = 0;

/**
 * Consulta en tiempo real si el bot está habilitado globalmente desde el panel de admin
 * Posee un cache ultra rápido de 3 segundos para evitar sobrecarga en la base de datos.
 */
export async function isBotGloballyActive(): Promise<boolean> {
  const now = Date.now();
  if (now - lastCheckTime < 3000) {
    return cachedIsActive;
  }

  try {
    const { data } = await supabase
      .from('system_configs')
      .select('value')
      .eq('key', 'whatsapp_bot_config')
      .single();

    if (data?.value) {
      cachedIsActive = data.value.is_bot_active !== false;
    }
  } catch (e) {
    // Fallback al estado en memoria
  }

  lastCheckTime = now;
  return cachedIsActive;
}

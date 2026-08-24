import { supabase } from '../config/supabase.js';

interface PausedChat {
  phone: string;
  pausedAt: Date;
  expiresAt: Date;
  timeoutId: NodeJS.Timeout;
}

class ChatPauseManager {
  private pausedChats = new Map<string, PausedChat>();

  /**
   * Obtiene la configuración de tiempo de pausa desde Supabase (por defecto 30 min)
   */
  async getPauseConfig(): Promise<{ enabled: boolean; minutes: number }> {
    try {
      const { data } = await supabase
        .from('system_configs')
        .select('value')
        .eq('key', 'whatsapp_bot_config')
        .single();

      if (data?.value) {
        const enabled = data.value.auto_pause_on_human_reply !== false;
        const minutes = Number(data.value.pause_duration_minutes) || 30;
        return { enabled, minutes };
      }
    } catch (e) {
      // Fallback a 30 minutos
    }
    return { enabled: true, minutes: 30 };
  }

  /**
   * Pausa las respuestas automáticas del bot para un número específico
   */
  async pauseChat(phone: string, blacklist: any, customMinutes?: number): Promise<void> {
    const { enabled, minutes: configMinutes } = await this.getPauseConfig();
    if (!enabled) return;

    const minutes = customMinutes || configMinutes;
    const durationMs = minutes * 60 * 1000;

    // Si ya existía una pausa previa para este chat, limpiamos el timer anterior
    if (this.pausedChats.has(phone)) {
      const existing = this.pausedChats.get(phone);
      if (existing) clearTimeout(existing.timeoutId);
    }

    // Agregar el número a la lista negra dinámica de BuilderBot
    if (blacklist && typeof blacklist.add === 'function') {
      blacklist.add(phone);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMs);

    // Programar la reactivación automática
    const timeoutId = setTimeout(() => {
      this.resumeChat(phone, blacklist);
      console.log(`\n======================================================`);
      console.log(`[AUTO-RESUME] 🤖 Bot reactivado para el chat: ${phone}`);
      console.log(`(Transcurrieron ${minutes} minutos desde la última respuesta humana)`);
      console.log(`======================================================\n`);
    }, durationMs);

    this.pausedChats.set(phone, {
      phone,
      pausedAt: now,
      expiresAt,
      timeoutId,
    });

    console.log(`\n======================================================`);
    console.log(`[AUTO-PAUSE] 👤 Operador humano respondió en el chat: ${phone}`);
    console.log(`⏱️  Bot silenciado para este chat durante ${minutes} minutos.`);
    console.log(`⏰ Se reactivará automáticamente a las: ${expiresAt.toLocaleTimeString('es-AR')}`);
    console.log(`======================================================\n`);
  }

  /**
   * Reactiva manualmente o por timeout un chat previamente pausado
   */
  resumeChat(phone: string, blacklist: any): void {
    if (this.pausedChats.has(phone)) {
      const item = this.pausedChats.get(phone);
      if (item) clearTimeout(item.timeoutId);
      this.pausedChats.delete(phone);
    }

    if (blacklist && typeof blacklist.remove === 'function') {
      blacklist.remove(phone);
    }
  }

  /**
   * Comprueba si un chat está actualmente pausado
   */
  isChatPaused(phone: string): boolean {
    return this.pausedChats.has(phone);
  }

  /**
   * Devuelve la lista de chats actualmente en pausa
   */
  getPausedChats(): { phone: string; remainingMinutes: number }[] {
    const now = Date.now();
    const list: { phone: string; remainingMinutes: number }[] = [];

    for (const [phone, item] of this.pausedChats.entries()) {
      const remainingMs = item.expiresAt.getTime() - now;
      if (remainingMs > 0) {
        list.push({
          phone,
          remainingMinutes: Math.ceil(remainingMs / 60000),
        });
      }
    }
    return list;
  }
}

export const pauseManager = new ChatPauseManager();

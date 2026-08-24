import { supabase, WEB_URL } from '../config/supabase.js';

export interface AffiliateCheckResult {
  found: boolean;
  nombre?: string;
  apellido?: string;
  legajo?: string;
  branch?: string;
  validationUrl?: string;
}

/**
 * Valida si una persona está registrada en el padrón de la Seccional
 * Permite buscar por DNI, Legajo o CUIL
 */
export async function validateAffiliate(query: string): Promise<AffiliateCheckResult> {
  try {
    const cleanQuery = query.replace(/\D/g, '').trim();
    if (!cleanQuery || cleanQuery.length < 4) {
      return { found: false };
    }

    const { data, error } = await supabase
      .from('affiliates')
      .select('id, nombre, apellido, legajo, dni, cuil, branch, validation_token')
      .or(`dni.eq.${cleanQuery},legajo.ilike.%${cleanQuery}%,cuil.ilike.%${cleanQuery}%`)
      .limit(1);

    if (error || !data || data.length === 0) {
      return { found: false };
    }

    const aff = data[0];
    const validationUrl = aff.validation_token
      ? `${WEB_URL}/#/validar/${aff.validation_token}`
      : `${WEB_URL}/#/carnet`;

    return {
      found: true,
      nombre: aff.nombre,
      apellido: aff.apellido,
      legajo: aff.legajo,
      branch: aff.branch || 'Noroeste',
      validationUrl,
    };
  } catch (err) {
    console.error('Error validating affiliate:', err);
    return { found: false };
  }
}

/**
 * Formatea el resultado de la validación para WhatsApp
 */
export function formatAffiliateStatus(res: AffiliateCheckResult, query: string): string {
  if (!res.found) {
    return `❌ *AFILIADO NO ENCONTRADO*\n\nNo se encontró ningún afiliado activo con el identificador *"${query}"* en el padrón de Seccional Noroeste.\n\n_Si consideras que es un error o necesitas iniciar tu trámite de afiliación, puedes comunicarte con un asesor gremial o ingresar en:_ \n👉 ${WEB_URL}/#/afiliate`;
  }

  return `✅ *ESTADO DE AFILIACIÓN CONFIRMADO*\n\n` +
    `👤 *Afiliado/a:* ${res.apellido?.toUpperCase()}, ${res.nombre}\n` +
    `🔖 *Legajo:* ${res.legajo || 'Registrado'}\n` +
    `🏢 *Seccional:* ${res.branch?.toUpperCase() || 'NOROESTE'}\n` +
    `🟢 *Condición:* Activo/a\n\n` +
    `💳 *Carnet Digital:* Puedes acceder a tu credencial y beneficios ingresando a:\n` +
    `👉 ${res.validationUrl}\n\n` +
    `_Presentá tu credencial digital para acceder a todos los convenios gremiales._`;
}

import { supabase } from "../supabaseClient";

/**
 * Registra una acción administrativa en la tabla audit_logs de Supabase.
 * @param actionType El tipo de acción (ej: 'CREAR_AFILIADO', 'CIERRE_CAJA')
 * @param description Descripción detallada de la acción realizada
 * @param branch Sucursal en la que se realiza la acción (por defecto 'noroeste')
 */
export async function logAction(actionType: string, description: string, branch: string = "noroeste") {
  try {
    const userStr = localStorage.getItem("current_affiliate");
    let adminName = "Administrador";
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && (user.nombre || user.apellido)) {
          adminName = `${user.nombre || ""} ${user.apellido || ""}`.trim() || "Administrador";
        }
      } catch (e) {
        // Ignorar si el JSON es inválido
      }
    }

    const { error } = await supabase
      .from("audit_logs")
      .insert({
        admin_name: adminName,
        action_type: actionType,
        description,
        branch,
      });

    if (error) {
      console.error("Error writing to audit_logs:", error);
    }
  } catch (err) {
    console.error("Error in logAction:", err);
  }
}

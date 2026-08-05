/**
 * Utility to verify if a user has administrator privileges.
 * Administrator actions are strictly restricted to:
 * 1. DNI 34185803 (System Admin)
 * 2. Ramiro Garcia Salado Kuhl (Legajo: 042418/00, CUIL: 23276817159)
 */
export const isUserAdmin = (user: any): boolean => {
  if (!user) return false;

  // 1. Check for System Admin (DNI 34185803 or ADMIN legajo/ID)
  const isSystemAdmin =
    user.dni === "34185803" ||
    user.legajo === "ADMIN" ||
    user.id === "admin-01";

  // 2. Check for Ramiro Garcia Salado Kuhl
  const isRamiro =
    user.legajo === "042418/00" ||
    user.cuil === "23276817159" ||
    user.email === "ramirogsk@gmail.com" ||
    (user.nombre &&
      user.nombre.toUpperCase().includes("RAMIRO") &&
      user.apellido &&
      user.apellido.toUpperCase().includes("GARCIA SALADO"));

  return isSystemAdmin || isRamiro;
};

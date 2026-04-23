/**
 * Normalizes a string for robust matching (Uppercase, no accents, no special chars)
 */
export const normalizeName = (name: string): string => {
  if (!name) return "";
  return name
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^A-Z\s]/g, " ") // Replace non-alphabetic chars with space
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim();
};

/**
 * Splits a full name "SURNAME, NAME" or "SURNAME NAME" into parts
 */
export const parseFullName = (fullName: string): { apellido: string; nombre: string } => {
  const normalized = fullName.toUpperCase().replace(",", " ").replace(".", " ");
  const parts = normalized.split(" ").filter(p => p.length > 0);
  
  if (parts.length >= 2) {
    // Basic heuristic: first part is surname, rest is name
    // This is often how these lists are structured (APELLIDO NOMBRE)
    return {
      apellido: parts[0],
      nombre: parts.slice(1).join(" ")
    };
  }
  
  return { apellido: normalized, nombre: "" };
};

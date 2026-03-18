export interface PiiReplacementRule {
  // patrón de búsqueda (RegExp en string para serializar/configurar)
  pattern: string;
  // si es global/multiline, etc.
  flags?: string; // "gimuy"
  // texto de reemplazo; puede contener grupos $1, $2...
  replaceWith: string;
}

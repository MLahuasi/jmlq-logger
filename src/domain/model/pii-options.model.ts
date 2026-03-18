import { PiiReplacementRule } from ".";

export interface PiiOptions {
  enabled?: boolean; // activa/desactiva redactor
  // lista blanca de claves cuya data no se debe redactor
  whitelistKeys?: string[];
  // lista negra de claves que forzosamente se deben redactor
  blacklistKeys?: string[];
  // patrones arbitrarios (e.g. emails, teléfonos, tarjetas)
  patterns?: PiiReplacementRule[];
  // si true, intenta redactor valores dentro de objetos profundamente
  deep?: boolean;
}

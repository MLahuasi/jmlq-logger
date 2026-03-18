import { PiiOptions } from "../model";
import { LogLevel } from "../value-objects";

export interface ICreateLoggerOptions {
  minLevel?: LogLevel; // Nivel mínimo aceptado
  redactPII?: boolean; // (deprecated) atajo para enabled en PiiOptions
  pii?: PiiOptions; // Configuración avanzada de PII
}

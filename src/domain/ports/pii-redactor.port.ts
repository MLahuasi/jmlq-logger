import { PiiOptions } from "../model";

export interface IPiiRedactor {
  // Redacta un valor arbitrario (string u objeto)
  // redact devuelve siempre el mismo tipo que recibe (T)
  // T cambia según lo que estés redactando
  redact<T = unknown>(value: T): T;
  // Opcionalmente permite actualizar opciones en caliente
  updateOptions?(opts: PiiOptions): void;
}

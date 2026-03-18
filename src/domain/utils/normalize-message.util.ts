import { IPiiRedactor } from "../ports";
import { LogMessage } from "../types";

// Normaliza el mensaje: si es función, la evalúa; si es objeto, se redacta; si es string, se redacta
export function normalizeMessage(
  message: LogMessage,
  redactor: IPiiRedactor
): string | Record<string, unknown> {
  const resolved = typeof message === "function" ? message() : message; // eval laziness
  return redactor.redact(resolved as any);
}

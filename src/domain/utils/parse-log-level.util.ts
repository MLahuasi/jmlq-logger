import { LogLevel } from "../value-objects";

// Convierte string a LogLevel con fallback seguro
export function parseLogLevel(
  input: string | number | undefined,
  fallback: LogLevel = LogLevel.INFO
): LogLevel {
  if (typeof input === "number")
    return (
      Object.values(LogLevel).includes(input) ? input : fallback
    ) as LogLevel;
  if (!input) return fallback;
  switch (String(input).toLowerCase()) {
    case "trace":
      return LogLevel.TRACE;
    case "debug":
      return LogLevel.DEBUG;
    case "info":
      return LogLevel.INFO;
    case "warn":
      return LogLevel.WARN;
    case "error":
      return LogLevel.ERROR;
    case "fatal":
      return LogLevel.FATAL;
    default:
      return fallback; // evita lanzar excepción por valores inesperados
  }
}

import { LogFilterRequest } from "../request";
import { ILogResponse } from "../response";
import { LogMessage } from "../types";
import { LogLevel } from "../value-objects";

export interface ILogger {
  // API genérica
  log(level: LogLevel, message: LogMessage, meta?: unknown): Promise<void>;

  // Helpers por nivel
  trace(message: LogMessage, meta?: unknown): Promise<void>;
  debug(message: LogMessage, meta?: unknown): Promise<void>;
  info(message: LogMessage, meta?: unknown): Promise<void>;
  warn(message: LogMessage, meta?: unknown): Promise<void>;
  error(message: LogMessage, meta?: unknown): Promise<void>;
  fatal(message: LogMessage, meta?: unknown): Promise<void>;

  // Lectura de logs
  getLogs(filter?: LogFilterRequest): Promise<ILogResponse[]>;

  // Flush explícito de buffers (si el datasource lo soporta)
  flush(): Promise<void>;
}

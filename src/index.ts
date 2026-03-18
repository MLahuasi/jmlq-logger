export { createLogger } from "./application/factory";
export type { ILoggerFactoryConfig } from "./application/types";

// 2) Contratos principales
export type { ILogger, ILogDatasource } from "./domain/ports";

// 3) Tipos de dominio útiles
export { LogLevel } from "./domain/value-objects";
export type { LogFilterRequest as LogSearchRequest } from "./domain/request";
export type { ILogResponse as LogRecord } from "./domain/response";

// 4) PII (config y servicio, para usuarios avanzados)
export type {
  PiiOptions as PiiRedactorOptions,
  LogEntry,
} from "./domain/model";
export { PiiRedactor } from "./domain/services/pii-redactor.service";

// 5) Utils públicos
export * as LoggerUtils from "./domain/utils";

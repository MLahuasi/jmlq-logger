import { ILogDatasource, ILogger, IPiiRedactor } from "../../domain/ports";
import { LogFilterRequest } from "../../domain/request";
import { LogLevel } from "../../domain/value-objects";
import { PiiRedactor } from "../../domain/services/pii-redactor.service";
import { DataSourceService } from "../../infrastructure/services";

import {
  SaveLogUseCase,
  GetLogsUseCase,
  FlushBuffersUseCase,
} from "../use-cases";
import { SaveLogDependencies } from "../use-cases/save-log";
import { ILoggerFactoryConfig } from "../types";

/**
 * Factory principal de @jmlq/logger.
 * Se encarga de:
 *  - Componer datasources (fan-out si hay varios)
 *  - Construir el redactor de PII
 *  - Instanciar y conectar los casos de uso
 *  - Exponer un servicio de logger de alto nivel
 */

export function createLogger(
  config: ILoggerFactoryConfig,
  source: string = "app-logger"
): ILogger {
  // 1) Normalizar config
  const minLevel = config.minLevel ?? LogLevel.INFO;

  const datasources = Array.isArray(config.datasources)
    ? config.datasources
    : [config.datasources];

  // 2) Componer datasource (si hay varios) con DataSourceService
  const ds: ILogDatasource =
    datasources.length === 1
      ? datasources[0]
      : new DataSourceService(datasources);

  // 3) Crear/usar redactor de PII
  const redactor: IPiiRedactor =
    config.redactor ?? new PiiRedactor(config.redactorOptions);

  // 4) Construir casos de uso de Application
  const saveLogUseCase = new SaveLogUseCase({
    ds,
    minLevel,
    redactor,
  } satisfies SaveLogDependencies);

  const getLogsUseCase = new GetLogsUseCase(ds);
  const flushBuffersUseCase = new FlushBuffersUseCase(ds);

  // 5) Construir facade de servicio de logging
  const service: ILogger = {
    // Método genérico de logging
    async log(level, message, meta) {
      await saveLogUseCase.execute("app-logger", level, message, meta);
    },

    // Helpers por nivel
    trace(message, meta) {
      return saveLogUseCase.execute(source, LogLevel.TRACE, message, meta);
    },
    debug(message, meta) {
      return saveLogUseCase.execute(source, LogLevel.DEBUG, message, meta);
    },
    info(message, meta) {
      return saveLogUseCase.execute(source, LogLevel.INFO, message, meta);
    },
    warn(message, meta) {
      return saveLogUseCase.execute(source, LogLevel.WARN, message, meta);
    },
    error(message, meta) {
      return saveLogUseCase.execute(source, LogLevel.ERROR, message, meta);
    },
    fatal(message, meta) {
      return saveLogUseCase.execute(source, LogLevel.FATAL, message, meta);
    },

    // Lectura de logs con filtros
    async getLogs(filter?: LogFilterRequest) {
      return getLogsUseCase.execute(filter);
    },

    // Flush explícito (si el datasource lo soporta)
    async flush() {
      await flushBuffersUseCase.execute();
    },
  };

  return service;
}

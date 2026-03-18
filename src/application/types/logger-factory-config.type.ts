import { ILogDatasource, IPiiRedactor } from "../../domain/ports";
import { PiiOptions } from "../../domain/model";
import { LogLevel } from "../../domain/value-objects";

/**
 * Configuración de alto nivel para construir el logger.
 * Es lo que recibe el usuario del paquete npm.
 */
export interface ILoggerFactoryConfig {
  /**
   * Datasource(s) concretos donde se van a persistir los logs.
   * Pueden venir uno o varios; si hay más de uno se compone con DataSourceService (fan-out).
   */
  datasources: ILogDatasource | ILogDatasource[];

  /**
   * Nivel mínimo de logging. Por defecto: INFO.
   */
  minLevel?: LogLevel;

  /**
   * Instancia de redactor de PII personalizada.
   * Si no se proporciona, se creará internamente un PiiRedactor con las opciones dadas.
   */
  redactor?: IPiiRedactor;

  /**
   * Opciones para el redactor de PII interno.
   * Solo se usan si no se pasa `redactor` explícito.
   */
  redactorOptions?: PiiOptions;
}

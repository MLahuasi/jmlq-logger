import { LogLevel } from "../../../domain/value-objects";
import { ILogDatasource, IPiiRedactor } from "../../../domain/ports";

export interface SaveLogDependencies {
  ds: ILogDatasource; // puerto de persistencia
  minLevel: LogLevel; // umbral mínimo
  redactor: IPiiRedactor; // servicio de PII
}

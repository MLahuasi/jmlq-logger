import { LogEntry } from "../../domain/model";
import { normalizeMessage } from "../../domain/utils";
import { LogMessage } from "../../domain/types";
import { LogLevel } from "../../domain/value-objects";
import { SaveLogDependencies } from "./save-log";

export class SaveLogUseCase {
  constructor(private readonly props: SaveLogDependencies) {}

  async execute(
    source: string,
    level: LogLevel,
    message: LogMessage,
    meta?: unknown
  ): Promise<void> {
    // 1) Filtro por nivel (evita hacer trabajo innecesario)
    if (level < this.props.minLevel) return; // no se loggea

    // 2) Normalización + PII
    const normalized = normalizeMessage(message, this.props.redactor);

    // 3) Construcción del evento
    const log: LogEntry = {
      source,
      level,
      message: normalized,
      meta: meta === undefined ? undefined : this.props.redactor.redact(meta),
      timestamp: Date.now(),
    };

    // 4) Persistencia (fan-out lo maneja el ds si es composite)
    await this.props.ds.save(log);
  }
}

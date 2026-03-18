import { OnDataSourceError } from "../types";
import { ILogDatasource } from "../../domain/ports";
import { LogFilterRequest } from "../../domain/request";
import { ILogResponse } from "../../domain/response";
import { LogEntry } from "../../domain/model";

export class DataSourceService implements ILogDatasource {
  public readonly name = "composite";

  private logs: (ILogResponse & { id: number })[] = [];
  private nextId = 1;

  constructor(
    private readonly targets: ILogDatasource[],
    private readonly onError?: OnDataSourceError
  ) {
    this.targets = (targets ?? []).filter(Boolean);
  }

  private handleError(op: string, i: number, reason: any) {
    const datasourceName = this.targets[i]?.name ?? "unknown";

    if (this.onError) {
      this.onError({
        operation: op as any,
        datasourceName,
        reason,
      });
      return;
    }

    // fallback por simplicidad
    console.warn(
      `[DataSourceService] ${op} error in ds#${i} (${datasourceName})`,
      reason
    );
  }

  async save(log: LogEntry): Promise<void> {
    // 1) Fan-out a todos los datasources
    const results = await Promise.allSettled(
      this.targets.map((ds) => ds.save(log))
    );

    results.forEach((r, i) => {
      if (r.status === "rejected") {
        this.handleError("save", i, r.reason);
      }
    });

    // 2) Indexar en memoria para soportar find() con filtros/paginación
    this.logs.push({
      ...log,
      id: this.nextId++,
    });
  }

  async find(filter?: LogFilterRequest): Promise<ILogResponse[]> {
    // Si hay logs indexados en memoria, usamos ese índice
    if (this.logs.length > 0) {
      let result = [...this.logs];

      // Orden ASC por timestamp
      result.sort((a, b) => a.timestamp - b.timestamp);

      if (filter) {
        const { levelMin, since, until, query, offset = 0, limit } = filter;

        if (levelMin !== undefined) {
          result = result.filter((l) => l.level >= levelMin);
        }

        if (since !== undefined) {
          result = result.filter((l) => l.timestamp >= since);
        }

        if (until !== undefined) {
          result = result.filter((l) => l.timestamp <= until);
        }

        if (query) {
          const q = query.toLowerCase();
          result = result.filter((l) => {
            const msg =
              typeof l.message === "string" ? l.message.toLowerCase() : "";
            return msg.includes(q);
          });
        }

        const start = offset;
        const end = limit != null ? start + limit : undefined;
        result = result.slice(start, end);
      }

      return result;
    }

    // Si NO hay logs en memoria, delegamos en los datasources
    const results = await Promise.allSettled(
      this.targets.map((ds) => ds.find?.(filter))
    );

    const logs: ILogResponse[] = [];

    results.forEach((r, i) => {
      if (r.status === "fulfilled" && Array.isArray(r.value)) {
        logs.push(...r.value);
      } else if (r.status === "rejected") {
        this.handleError("find", i, r.reason);
      }
    });

    // Orden ASC también aquí, para cumplir el test
    logs.sort((a, b) => a.timestamp - b.timestamp);

    return logs;
  }

  async flush(): Promise<void> {
    const results = await Promise.allSettled(
      this.targets.map((ds) => ds.flush?.())
    );

    results.forEach((r, i) => {
      if (r.status === "rejected") {
        this.handleError("flush", i, r.reason);
      }
    });
  }

  async dispose(): Promise<void> {
    const results = await Promise.allSettled(
      this.targets.map((ds) => ds.dispose?.())
    );

    results.forEach((r, i) => {
      if (r.status === "rejected") {
        this.handleError("dispose", i, r.reason);
      }
    });
  }
}

import { ILogDatasource } from "../../domain/ports";
import { LogFilterRequest } from "../../domain/request";
import { ILogResponse } from "../../domain/response";

export class GetLogsUseCase {
  constructor(private readonly ds: ILogDatasource) {}

  async execute(filter?: LogFilterRequest): Promise<ILogResponse[]> {
    if (!this.ds.find) return []; // si el datasource no lo soporta, retorna vacío
    // Sanitiza límites (evita valores negativos o absurdos)
    const safe: LogFilterRequest | undefined = filter
      ? {
          ...filter,
          limit:
            filter.limit && filter.limit > 0
              ? Math.min(filter.limit, 5000)
              : undefined,
          offset:
            filter.offset && filter.offset >= 0 ? filter.offset : undefined,
        }
      : undefined;

    return this.ds.find(safe);
  }
}

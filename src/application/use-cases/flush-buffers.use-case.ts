import { ILogDatasource } from "../../domain/ports";

export class FlushBuffersUseCase {
  constructor(private readonly ds: ILogDatasource) {}
  async execute(): Promise<void> {
    // flush es opcional; si no está implementado, no hace nada
    await this.ds.flush?.();
  }
}

# Configuración — @jmlq/logger ⚙️

Esta sección se enfoca en **cómo configurar el core** y **cómo construir datasources** (usando plugins o implementaciones propias).

## Datasources y plugins

### Opción A: usar un plugin oficial (recomendado)

Ejemplo con filesystem:

```ts
import { createFsDatasource } from "@jmlq/logger-plugin-fs";

const fsDatasource = createFsDatasource({
  basePath: "./logs",
  mkdir: true,
  rotation: { by: "day" },
  fileNamePattern: "app-{yyyy}{MM}{dd}.log",
});
```

Ejemplo con múltiples destinos (fan-out) usando el core:

```ts
import { createLogger, LogLevel } from "@jmlq/logger";
import { createFsDatasource } from "@jmlq/logger-plugin-fs";

// (Ejemplo) Si tienes otro datasource (Mongo/Pg/otro), puedes combinarlo.
const fs = createFsDatasource({ basePath: "./logs", mkdir: true });

const logger = createLogger({
  datasources: [fs],
  minLevel: LogLevel.INFO,
});
```

> Nota: si pasas un arreglo de datasources, el core compone internamente un datasource “composite” y hace fan-out.

### Opción B: crear tu propio `ILogDatasource`

El core depende del contrato `ILogDatasource`:

```ts
import type { ILogDatasource, LogRecord, LogSearchRequest } from "@jmlq/logger";
import type { LogEntry } from "@jmlq/logger";

export class MyDatasource implements ILogDatasource {
  readonly name = "my-ds";

  async save(log: LogEntry): Promise<void> {
    // Persistencia real: DB, cola, API, etc.
  }

  async find(filter?: LogSearchRequest): Promise<LogRecord[]> {
    // Opcional: implementar consulta
    return [];
  }

  async flush(): Promise<void> {
    // Opcional: si manejas buffers/colas
  }

  async dispose(): Promise<void> {
    // Opcional: cerrar conexiones
  }
}
```

## PII Redaction

El core puede crear un `PiiRedactor` internamente usando `redactorOptions`.

### Reglas disponibles

- `enabled`: activa/desactiva.
- `patterns`: reglas declarativas `{ pattern, flags, replaceWith }`.
- `whitelistKeys`: claves que nunca se redactan.
- `blacklistKeys`: claves que siempre se redactan a `"[REDACTED]"`.
- `deep`: redactar recursivamente objetos/arrays.

Ejemplo:

```ts
import { createLogger, LogLevel, type PiiRedactorOptions } from "@jmlq/logger";

const pii: PiiRedactorOptions = {
  enabled: true,
  whitelistKeys: ["requestId"],
  blacklistKeys: ["password", "refreshToken"],
  patterns: [{ pattern: "\\b\\d{16}\\b", flags: "g", replaceWith: "[CARD]" }],
  deep: true,
};

const logger = createLogger({
  datasources: /* tu datasource */ [] as any,
  minLevel: LogLevel.INFO,
  redactorOptions: pii,
});
```

### Redactor custom (avanzado)

Si necesitas una estrategia propia, implementa `IPiiRedactor` y pásala como `redactor`.

## Niveles de log

Usa `LogLevel`:

- `TRACE` (10)
- `DEBUG` (20)
- `INFO` (30)
- `WARN` (40)
- `ERROR` (50)
- `FATAL` (60)

Para parsear desde texto: `LoggerUtils.parseLogLevel(input, fallback)`.

## ✅ Checklist

- [ ] Elegir plugin datasource o implementar `ILogDatasource` propio.
- [ ] Decidir `minLevel`.
- [ ] Configurar PII (`redactorOptions`) o inyectar `redactor` custom.
- [ ] (Opcional) definir un `source` por módulo al crear loggers por contexto.

---

## ⬅️ Anterior

- [`arquitectura`](./architecture.md)

## ➡️ Siguiente

- [Integración Express](./integration-express.md)
- [Troubleshooting](./troubleshooting.md)

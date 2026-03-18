# @jmlq/logger — Architecture 🏛️

## 🎯 Objetivo

Definir un core de logging independiente del framework que permita:

- Persistir logs mediante `ILogDatasource`.
- Redactar PII antes de escribir.
- Escalar a múltiples destinos (fan-out) sin acoplar al host.

## ⭐ Importancia

- El host decide **dónde** se guardan logs (FS/Mongo/Postgres/otro).
- El core decide **cómo** se normaliza, redacta y filtra por nivel.
- Cambiar de Express a otro runtime no cambia el core, solo la integración.

## 🧱 Componentes principales (lo que expone el paquete)

### `createLogger(config, source?)`

Factory principal. Recibe `ILoggerFactoryConfig` y devuelve un `ILogger`.

- Normaliza `minLevel` (default: `INFO`).
- Si hay múltiples datasources, compone `DataSourceService` (fan-out).
- Construye `PiiRedactor` interno si no pasas `redactor`.
- Conecta use-cases (`SaveLogUseCase`, `GetLogsUseCase`, `FlushBuffersUseCase`).

### `ILogger`

Contrato de alto nivel:

- `trace|debug|info|warn|error|fatal`
- `getLogs(filter?)`
- `flush()`

### `ILogDatasource`

Puerto de persistencia:

- `save(log)` (obligatorio)
- `find?(filter?)` (opcional)
- `flush?()` (opcional)
- `dispose?()` (opcional)

### PII

- `PiiRedactor` + `PiiRedactorOptions`
- Helpers: `LoggerUtils.parseLogLevel`, `LoggerUtils.normalizeMessage`, `LoggerUtils.toPiiRegex`.

## 🔁 Flujos (diagramas)

### Flujo de escritura (save)

```mermaid
sequenceDiagram
  autonumber
  participant Host as Host (Express/Worker)
  participant Logger as ILogger (createLogger)
  participant UC as SaveLogUseCase
  participant PII as IPiiRedactor
  participant DS as ILogDatasource

  Host->>Logger: info(message, meta)
  Logger->>UC: execute(source, level, message, meta)
  UC->>UC: if level < minLevel => return
  UC->>PII: normalizeMessage(message)
  UC->>PII: redact(meta)
  UC->>DS: save(LogEntry)
```

### Flujo de lectura (getLogs)

```mermaid
sequenceDiagram
  autonumber
  participant Host as Host
  participant Logger as ILogger
  participant UC as GetLogsUseCase
  participant DS as ILogDatasource

  Host->>Logger: getLogs(filter?)
  Logger->>UC: execute(filter?)
  UC->>DS: find?(safeFilter)
  alt datasource no implementa find
    UC-->>Logger: []
  else find() existe
    DS-->>UC: logs[]
    UC-->>Logger: logs[]
  end
```

## 🧩 Clean Architecture (mapeo real)

```mermaid
flowchart TB
  subgraph Domain
    VO[LogLevel]
    M[LogEntry, PiiOptions]
    Ports[ILogDatasource, ILogger, IPiiRedactor]
    Utils[normalizeMessage, parseLogLevel, toPiiRegex]
    Svc[PiiRedactor]
  end

  subgraph Application
    Factory[createLogger]
    UC1[SaveLogUseCase]
    UC2[GetLogsUseCase]
    UC3[FlushBuffersUseCase]
  end

  subgraph Infrastructure
    Composite[DataSourceService<br>fan-out]
  end

  Factory --> UC1
  Factory --> UC2
  Factory --> UC3
  Factory --> Svc

  UC1 --> Ports
  UC2 --> Ports
  UC3 --> Ports

  Composite --> Ports
```

## ✅ Checklist

- [ ] Definir al menos un `ILogDatasource` (plugin o implementación propia).
- [ ] Decidir el `minLevel`.
- [ ] Configurar `PiiRedactorOptions` (o proveer un `IPiiRedactor` custom).
- [ ] Integrar `ILogger` en el host (por DI/middleware/adapter).

## ⬅️ Anterior

- [`inicio`](../../README.es.md)

## ➡️ Siguiente

- [Configuración](./configuration.md)
- [Integración Express](./integration-express.md)
- [Troubleshooting](./troubleshooting.md)

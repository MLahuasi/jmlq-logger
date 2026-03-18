# @jmlq/logger — Architecture 🏛️

## 🎯 Objective

Define a framework-independent logging core that allows:

- Persisting logs through `ILogDatasource`
- Redacting PII before writing
- Scaling to multiple destinations (fan-out) without coupling to the host

## ⭐ Importance

- The host decides **where** logs are stored (FS/Mongo/Postgres/other)
- The core decides **how** logs are normalized, redacted, and filtered by level
- Switching from Express to another runtime does not affect the core, only the integration

## 🧱 Main components (what the package exposes)

### `createLogger(config, source?)`

Main factory. Receives `ILoggerFactoryConfig` and returns an `ILogger`.

- Normalizes `minLevel` (default: `INFO`)
- If multiple datasources are provided, composes `DataSourceService` (fan-out)
- Builds an internal `PiiRedactor` if none is provided
- Connects use cases (`SaveLogUseCase`, `GetLogsUseCase`, `FlushBuffersUseCase`)

### `ILogger`

High-level contract:

- `trace|debug|info|warn|error|fatal`
- `getLogs(filter?)`
- `flush()`

### `ILogDatasource`

Persistence port:

- `save(log)` (required)
- `find?(filter?)` (optional)
- `flush?()` (optional)
- `dispose?()` (optional)

### PII

- `PiiRedactor` + `PiiRedactorOptions`
- Helpers: `LoggerUtils.parseLogLevel`, `LoggerUtils.normalizeMessage`, `LoggerUtils.toPiiRegex`

## 🔁 Flows (diagrams)

### Write flow (save)

```mermaid id="c9w2rx"
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

### Read flow (getLogs)

```mermaid id="p4n8xz"
sequenceDiagram
  autonumber
  participant Host as Host
  participant Logger as ILogger
  participant UC as GetLogsUseCase
  participant DS as ILogDatasource

  Host->>Logger: getLogs(filter?)
  Logger->>UC: execute(filter?)
  UC->>DS: find?(safeFilter)
  alt datasource does not implement find
    UC-->>Logger: []
  else find() exists
    DS-->>UC: logs[]
    UC-->>Logger: logs[]
  end
```

## 🧩 Clean Architecture (real mapping)

```mermaid id="t7m3qa"
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

- [ ] Define at least one `ILogDatasource` (plugin or custom implementation)
- [ ] Decide the `minLevel`
- [ ] Configure `PiiRedactorOptions` (or provide a custom `IPiiRedactor`)
- [ ] Integrate `ILogger` into the host (via DI/middleware/adapter)

## ⬅️ Previous

- [`home`](../../README.md)

## ➡️ Next

- [Configuration](./configuration.md)
- [Express Integration](./integration-express.md)
- [Troubleshooting](./troubleshooting.md)

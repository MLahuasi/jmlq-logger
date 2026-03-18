# @jmlq/logger 🧩

## 🎯 Objective

Provide a **framework-agnostic logger** (Express today, something else tomorrow) that:

- Exposes a simple API (`trace|debug|info|warn|error|fatal`)
- Persists logs through one or more **datasources** (`ILogDatasource`)
- Supports **PII redaction** (sensitive data) before persisting

## ⭐ Importance

- **Real Clean Architecture**: the core does not depend on Express, Mongo, Postgres, or filesystem
- **Fan-out** (multi-datasource) without duplicating logic in the host
- **PII-by-design**: message and metadata can be processed by a redactor before leaving the process

## 🏗️ Architecture (quick view)

➡️ See details: [architecture.md](./docs/en/architecture.md)

## 🔧 Implementation

### 5.1 Installation

```bash
npm i @jmlq/logger
```

For real persistence, install a datasource plugin (optional):

```bash
npm i @jmlq/logger-plugin-fs
# or
npm i @jmlq/logger-plugin-mongo
# or
npm i @jmlq/logger-plugin-postgresql
```

### 5.2 Dependencies

- **Runtime**: the core remains minimal (no direct I/O integration)
- **Plugins**: integrate with filesystem / MongoDB / PostgreSQL and expose a compatible `ILogDatasource`

### 5.3 Quickstart (rapid implementation)

Example using the filesystem plugin (real datasource):

```ts
import { createLogger, LogLevel, type PiiRedactorOptions } from "@jmlq/logger";
import { createFsDatasource } from "@jmlq/logger-plugin-fs";

const pii: PiiRedactorOptions = {
  enabled: true,
  blacklistKeys: ["password", "token"],
  patterns: [
    // email
    {
      pattern: "[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}",
      flags: "ig",
      replaceWith: "[EMAIL]",
    },
  ],
  deep: true,
};

const fsDatasource = createFsDatasource({
  basePath: "./logs",
  mkdir: true,
  rotation: { by: "day" },
});

const logger = createLogger({
  datasources: fsDatasource,
  minLevel: LogLevel.INFO,
  redactorOptions: pii,
});

await logger.info("server.started", {
  port: 3000,
  adminEmail: "admin@example.com",
});
await logger.warn(() => ({ msg: "suspicious.payload", token: "secret" }));
```

### 5.4 Environment variables (.env) 📦

`@jmlq/logger` **does not read environment variables internally**. Configuration is done in code by passing `ILoggerFactoryConfig` to `createLogger()`.

If your host prefers `.env`, a typical pattern is mapping `process.env` → `LoggerFactoryConfig`:

```ts
import { createLogger, LoggerUtils, LogLevel } from "@jmlq/logger";

const minLevel: LogLevel = LoggerUtils.parseLogLevel(
  process.env.LOG_LEVEL,
  LogLevel.INFO,
);

// ...build one or more datasources depending on your host
```

### 5.5 Helpers and key features

- **Multi-datasource fan-out**
  - If you pass `datasources: ILogDatasource[]`, the core composes a “composite” datasource (`DataSourceService`) and fans out to all targets
  - It also keeps an in-memory index of written logs to support `getLogs()` even if a datasource does not implement `find()`

- **PII Redaction (PiiRedactor)**
  - Redacts `message` and `meta`
  - Supports `patterns` (serializable RegExp), `whitelistKeys`, `blacklistKeys`, and `deep`

- **Lazy message**
  - `logger.info(() => ({ ... }))` evaluates the message only if the level passes the filter

## ✅ Checklist (quick steps)

- [Install](#51-installation)
- [Choose a datasource](./docs/en/configuration.md#datasources-and-plugins)
- [Configure PII](./docs/en/configuration.md#pii-redaction)
- [Integrate with Express](./docs/en/integration-express.md)
- [Troubleshooting checklist](./docs/en/troubleshooting.md)

## 📌 Menu

- [Architecture](./docs/en/architecture.md)
- [Configuration](./docs/en/configuration.md)
- [Express Integration](./docs/en/integration-express.md)
- [Troubleshooting](./docs/en/troubleshooting.md)

## 🔗 References

Persistence plugins:

- [`@jmlq/logger-plugin-fs`](https://github.com/MLahuasi/jmlq-logger-plugin-fs#readme)
- [`@jmlq/logger-plugin-mongo`](https://github.com/MLahuasi/jmlq-logger-plugin-mongo#readme)
- [`@jmlq/logger-plugin-postgresql`](https://github.com/MLahuasi/jmlq-logger-plugin-postgresql#readme)

## ⬅️ 🌐 Ecosystem

- [`@jmlq`](https://github.com/MLahuasi/jmlq-ecosystem#readme)

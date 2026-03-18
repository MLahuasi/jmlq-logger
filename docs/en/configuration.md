# Configuration — @jmlq/logger ⚙️

This section focuses on **how to configure the core** and **how to build datasources** (using plugins or custom implementations).

## Datasources and plugins

### Option A: use an official plugin (recommended)

Example with filesystem:

```ts
import { createFsDatasource } from "@jmlq/logger-plugin-fs";

const fsDatasource = createFsDatasource({
  basePath: "./logs",
  mkdir: true,
  rotation: { by: "day" },
  fileNamePattern: "app-{yyyy}{MM}{dd}.log",
});
```

Example with multiple destinations (fan-out) using the core:

```ts
import { createLogger, LogLevel } from "@jmlq/logger";
import { createFsDatasource } from "@jmlq/logger-plugin-fs";

// (Example) If you have another datasource (Mongo/Pg/other), you can combine it.
const fs = createFsDatasource({ basePath: "./logs", mkdir: true });

const logger = createLogger({
  datasources: [fs],
  minLevel: LogLevel.INFO,
});
```

> Note: if you pass an array of datasources, the core internally composes a “composite” datasource and performs fan-out.

### Option B: create your own `ILogDatasource`

The core depends on the `ILogDatasource` contract:

```ts
import type { ILogDatasource, LogRecord, LogSearchRequest } from "@jmlq/logger";
import type { LogEntry } from "@jmlq/logger";

export class MyDatasource implements ILogDatasource {
  readonly name = "my-ds";

  async save(log: LogEntry): Promise<void> {
    // Real persistence: DB, queue, API, etc.
  }

  async find(filter?: LogSearchRequest): Promise<LogRecord[]> {
    // Optional: implement querying
    return [];
  }

  async flush(): Promise<void> {
    // Optional: if you manage buffers/queues
  }

  async dispose(): Promise<void> {
    // Optional: close connections
  }
}
```

## PII Redaction

The core can internally create a `PiiRedactor` using `redactorOptions`.

### Available rules

- `enabled`: enable/disable
- `patterns`: declarative rules `{ pattern, flags, replaceWith }`
- `whitelistKeys`: keys that are never redacted
- `blacklistKeys`: keys that are always redacted to `"[REDACTED]"`
- `deep`: recursively redact objects/arrays

Example:

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
  datasources: /* your datasource */ [] as any,
  minLevel: LogLevel.INFO,
  redactorOptions: pii,
});
```

### Custom redactor (advanced)

If you need a custom strategy, implement `IPiiRedactor` and pass it as `redactor`.

## Log levels

Use `LogLevel`:

- `TRACE` (10)
- `DEBUG` (20)
- `INFO` (30)
- `WARN` (40)
- `ERROR` (50)
- `FATAL` (60)

To parse from text: `LoggerUtils.parseLogLevel(input, fallback)`.

## ✅ Checklist

- [ ] Choose a datasource plugin or implement a custom `ILogDatasource`
- [ ] Decide `minLevel`
- [ ] Configure PII (`redactorOptions`) or inject a custom `redactor`
- [ ] (Optional) define a `source` per module when creating contextual loggers

---

## ⬅️ Previous

- [`architecture`](./architecture.md)

## ➡️ Next

- [Express Integration](./integration-express.md)
- [Troubleshooting](./troubleshooting.md)

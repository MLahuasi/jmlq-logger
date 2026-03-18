# Express Integration — @jmlq/logger 🚏

## 🎯 Objective

Attach an `ILogger` instance to each request context so it can be used from:

- controllers (`req.logger?.info(...)`)
- middlewares
- services in the `presentation` layer

> In the reference host (ml-dev-rest-api), `req.logger?.info(...)` is used in Auth controllers, so the recommended pattern is to inject the logger via middleware.

## 1) Extend Express types (TypeScript)

Create a types file, for example `src/@types/express/index.d.ts`:

```ts id="q1n7zs"
import type { ILogger } from "@jmlq/logger";

declare global {
  namespace Express {
    interface Request {
      logger?: ILogger;
      requestId?: string;
    }
  }
}

export {};
```

## 2) `attachLogger` middleware

```ts id="m8v2xp"
import type { ILogger } from "@jmlq/logger";
import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

/**
 * Attaches a base logger and a requestId for traceability.
 */
export function attachLogger(base: ILogger) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.logger = base;

    // Reuse x-request-id if it comes from a proxy/gateway
    req.requestId = (req.headers["x-request-id"] as string) ?? randomUUID();

    next();
  };
}
```

## 3) Initialize the logger (composition root)

In your `bootstrap` (for example `src/app.ts` or `src/infrastructure/logger/index.ts`):

```ts id="v4k9zr"
import { createLogger, LogLevel } from "@jmlq/logger";
import { createFsDatasource } from "@jmlq/logger-plugin-fs";

const fs = createFsDatasource({ basePath: "./logs", mkdir: true });

export const logger = createLogger({
  datasources: fs,
  minLevel: LogLevel.INFO,
});
```

## 4) Use middleware in Express

```ts id="t6w3bn"
import express from "express";
import { logger } from "./infrastructure/logger";
import { attachLogger } from "./presentation/middlewares/attach-logger";

const app = express();
app.use(express.json());
app.use(attachLogger(logger));

app.get("/health", (req, res) => {
  req.logger?.info("health.check", { requestId: req.requestId });
  res.json({ ok: true });
});
```

## ✅ Checklist

- [ ] Create `ILogger` with `createLogger()`
- [ ] Extend `Express.Request` types
- [ ] Create `attachLogger(base)` middleware
- [ ] Use `req.logger?.<level>()` in controllers/middlewares

---

## ⬅️ Previous

- [`architecture`](./architecture.md)

## ➡️ Next

- [Configuration](./configuration.md)
- [Troubleshooting](./troubleshooting.md)

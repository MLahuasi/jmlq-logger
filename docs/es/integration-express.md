# Integración con Express — @jmlq/logger 🚏

## 🎯 Objetivo

Adjuntar una instancia de `ILogger` al contexto de cada request para poder usarla desde:

- controllers (`req.logger?.info(...)`)
- middlewares
- services de la capa `presentation`

> En el host de referencia (ml-dev-rest-api) se usa `req.logger?.info(...)` en controllers de Auth, por lo que el patrón recomendado es inyectar el logger vía middleware.

## 1) Extender tipos de Express (TypeScript)

Crea un archivo de tipos, por ejemplo `src/@types/express/index.d.ts`:

```ts
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

## 2) Middleware `attachLogger`

```ts
import type { ILogger } from "@jmlq/logger";
import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

/**
 * Adjunta un logger base y un requestId para trazabilidad.
 */
export function attachLogger(base: ILogger) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.logger = base;

    // Reutiliza x-request-id si viene de un proxy/gateway
    req.requestId = (req.headers["x-request-id"] as string) ?? randomUUID();

    next();
  };
}
```

## 3) Inicializar el logger (composition root)

En tu `bootstrap` (por ejemplo `src/app.ts` o `src/infrastructure/logger/index.ts`):

```ts
import { createLogger, LogLevel } from "@jmlq/logger";
import { createFsDatasource } from "@jmlq/logger-plugin-fs";

const fs = createFsDatasource({ basePath: "./logs", mkdir: true });

export const logger = createLogger({
  datasources: fs,
  minLevel: LogLevel.INFO,
});
```

## 4) Usar middleware en Express

```ts
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

- [ ] Crear `ILogger` con `createLogger()`.
- [ ] Extender tipos de `Express.Request`.
- [ ] Crear middleware `attachLogger(base)`.
- [ ] Usar `req.logger?.<level>()` en controllers/middlewares.

---

## ⬅️ Anterior

- [`arquitectura`](./architecture.md)

## ➡️ Siguiente

- [Configuración](./configuration.md)
- [Troubleshooting](./troubleshooting.md)

# Troubleshooting — @jmlq/logger 🩺

## 🎯 Objective

Resolve common issues when integrating `@jmlq/logger` into a host (Express or others), especially when using persistence plugins.

## Common issues

### 1) “I don’t see persisted logs”

- Verify that you are passing **at least one real `ILogDatasource`** (plugin or custom).
- If you pass an empty array, the logger may still “work” (no error), but it will not persist to external destinations.

Checklist:

- Did you create the datasource (`createFsDatasource`, `createMongoDatasource`, etc.)?
- Did you pass it to `createLogger({ datasources: ... })`?

### 2) “`getLogs()` returns `[]`”

This is expected if your datasource **does not implement `find()`**. The core returns `[]` when `ds.find` is not available.

- Solution: use a datasource that implements `find()` or implement `find()` in your custom datasource.

### 3) “PII is not redacted”

- Ensure `redactorOptions.enabled = true`.
- If you use `whitelistKeys`, remember those keys **are not redacted**.

### 4) “My RegExp patterns don’t work”

The core converts declarative rules into `RegExp`. If the pattern is invalid, it falls back to a regex that **never matches**, without throwing an exception.

Checklist:

- Test the pattern in a controlled environment.
- Verify flags (`g`, `i`, etc.).

### 5) “There is overhead when logging large objects”

- Reduce `deep` if deep redaction is not required.
- Avoid passing large objects in `meta`.
- Use lazy messages: `logger.debug(() => expensiveObject())`.

### 6) “I want to close resources when shutting down the process”

- The core exposes `flush()` and the `ILogDatasource` port supports `dispose?()`.
- If your plugin/datasource implements `dispose`, close it from your composition root (e.g., on `SIGINT/SIGTERM`).

## ✅ Checklist

- [ ] Validate that there is at least one real datasource
- [ ] Confirm whether the datasource implements `find()` (for `getLogs()`)
- [ ] Enable PII (`enabled: true`) and review whitelist/blacklist
- [ ] Verify RegExp patterns
- [ ] Use `flush()`/`dispose()` on controlled shutdown

---

## ⬅️ Previous

- [`architecture`](./architecture.md)

## ➡️ Next

- [Configuration](./configuration.md)
- [Express Integration](./integration-express.md)

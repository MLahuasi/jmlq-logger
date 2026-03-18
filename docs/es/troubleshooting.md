# Troubleshooting — @jmlq/logger 🩺

## 🎯 Objetivo

Resolver problemas comunes al integrar `@jmlq/logger` en un host (Express u otro), especialmente cuando usas plugins de persistencia.

## Problemas comunes

### 1) “No veo logs persistidos”

- Verifica que **estás pasando al menos un `ILogDatasource` real** (plugin o custom).
- Si pasas un arreglo vacío, el logger puede seguir “funcionando” (no lanza), pero no persistirá en destinos externos.

Checklist:

- ¿Creaste el datasource (`createFsDatasource`, `createMongoDatasource`, etc.)?
- ¿Lo pasaste a `createLogger({ datasources: ... })`?

### 2) “`getLogs()` devuelve `[]`”

Esto es esperado si tu datasource **no implementa `find()`**. El core retorna `[]` cuando `ds.find` no existe.

- Solución: usa un datasource que implemente `find()` o implementa `find()` en tu datasource custom.

### 3) “PII no se redacta”

- Asegúrate de habilitar `redactorOptions.enabled = true`.
- Si usas `whitelistKeys`, recuerda que esas claves **no se redactan**.

### 4) “Mis patrones RegExp no funcionan”

El core convierte reglas declarativas a `RegExp`. Si el patrón es inválido, cae en un regex que **nunca hace match**, sin lanzar excepción.

Checklist:

- Prueba el patrón en un entorno controlado.
- Revisa flags (`g`, `i`, etc.).

### 5) “Hay overhead al loguear objetos grandes”

- Reduce `deep` si no necesitas redacción profunda.
- Evita pasar objetos enormes en `meta`.
- Usa mensajes perezosos: `logger.debug(() => expensiveObject())`.

### 6) “Quiero cerrar recursos al apagar el proceso”

- El core expone `flush()` y el puerto `ILogDatasource` soporta `dispose?()`.
- Si tu plugin/datasource implementa `dispose`, ciérralo desde tu composition root (ej. en `SIGINT/SIGTERM`).

## ✅ Checklist

- [ ] Validar que hay al menos un datasource real.
- [ ] Confirmar si el datasource implementa `find()` (para `getLogs()`).
- [ ] Habilitar PII (`enabled: true`) y revisar whitelist/blacklist.
- [ ] Verificar patrones RegExp.
- [ ] Usar `flush()`/`dispose()` en cierre controlado.

---

## ⬅️ Anterior

- [`arquitectura`](./architecture.md)

## ➡️ Siguiente

- [Configuración](./configuration.md)
- [Integración Express](./integration-express.md)

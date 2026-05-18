# Contexto del Proyecto

## Proposito del archivo

Este archivo resume el contexto estructural estable del repositorio para que futuros hilos entiendan rapidamente que es `@jmlq/logger`, como esta organizado y que piezas conviene revisar antes de modificarlo.

## Naturaleza del proyecto

Este repositorio implementa el core del paquete `@jmlq/logger`, una libreria TypeScript publicada como paquete reutilizable. No es una aplicacion final; es un componente de infraestructura para que otros hosts o plugins integren persistencia de logs sin acoplar el core a Express, filesystem, MongoDB o PostgreSQL.

## Objetivo del proyecto

Proveer un logger desacoplado del framework que:

- exponga una API simple por niveles (`trace`, `debug`, `info`, `warn`, `error`, `fatal`);
- permita persistir logs mediante uno o varios `ILogDatasource`;
- soporte fan-out multi-datasource;
- aplique redaccion de PII antes de persistir;
- mantenga el core independiente de integraciones concretas.

## Arquitectura

La estructura real del codigo sigue una separacion por capas:

- `src/application`
- `src/domain`
- `src/infrastructure`

El punto de entrada publico es `src/index.ts`, que reexporta la factory `createLogger`, contratos principales, tipos utiles, `PiiRedactor` y utilidades como `LoggerUtils`.

## Enfoque arquitectonico

El paquete sigue un enfoque de Clean Architecture orientado a puertos y casos de uso:

- `domain` concentra contratos, modelos, value objects, utilidades y el servicio de redaccion de PII.
- `application` compone dependencias y expone casos de uso como guardar logs, obtener logs y hacer flush.
- `infrastructure` implementa adaptadores internos del core, especialmente el datasource compuesto para fan-out.

La persistencia real queda delegada a plugins o implementaciones externas que satisfacen `ILogDatasource`.

## Capas del sistema

### Domain

Objetivo: definir el lenguaje del dominio de logging.

Piezas relevantes:

- `ports/`: `ILogger`, `ILogDatasource`, `IPiiRedactor`, contratos de opciones.
- `model/`: `LogEntry`, `PiiOptions`, reglas de reemplazo.
- `value-objects/`: `LogLevel`.
- `request/` y `response/`: contratos de filtrado y salida.
- `services/pii-redactor.service.ts`: redaccion de datos sensibles.
- `utils/`: normalizacion de mensajes, parseo de niveles y conversion de regex serializable.

### Application

Objetivo: orquestar el uso del dominio y exponer la API operativa del paquete.

Piezas relevantes:

- `factory/logger.factory.ts`: compone datasource, redactor y casos de uso.
- `use-cases/save-log.use-case.ts`: filtra por nivel, normaliza/redacta y persiste.
- `use-cases/get-logs.use-case.ts`: obtiene logs filtrados.
- `use-cases/flush-buffers.use-case.ts`: delega flush si el datasource lo soporta.
- `types/logger-factory-config.type.ts`: contrato de configuracion de entrada.

### Infrastructure

Objetivo: resolver mecanismos internos de soporte sin romper el desacople del core.

Pieza relevante:

- `services/datasource.service.ts`: implementa `ILogDatasource` compuesto, hace fan-out a multiples targets, maneja errores por datasource e indexa logs en memoria para soportar `find()` aun cuando un datasource no lo implemente.

## Aspectos tecnicos mas relevantes

- El paquete esta escrito en TypeScript y compila a `dist/`.
- La API publica sale por `src/index.ts`.
- `createLogger(config, source?)` es la factory principal.
- `minLevel` se normaliza con default `LogLevel.INFO`.
- Si `datasources` recibe un arreglo, se usa `DataSourceService` como composite datasource.
- La redaccion de PII puede resolverse con un `redactor` provisto o con `PiiRedactor` construido desde `redactorOptions`.
- `PiiRedactor` soporta `patterns`, `whitelistKeys`, `blacklistKeys` y redaccion profunda.
- `DataSourceService` usa `Promise.allSettled()` para que fallos parciales no rompan el fan-out completo.
- Existe una indexacion en memoria de logs escritos para soportar consultas aun cuando los datasources externos no expongan `find()`.
- Las pruebas viven en `tests/`.
- La documentacion publica del paquete ya existe en `docs/es` y `docs/en`.

## Dependencias principales

Dependencias de desarrollo observadas en `package.json`:

- `typescript`
- `jest`
- `@swc/core`
- `@swc/jest`
- `tsx`
- `rimraf`
- `@types/node`
- `@types/jest`

El core se mantiene sin integraciones directas de runtime para persistencia; los datasources concretos viven en paquetes plugin externos.

## Referencias internas utiles

- `README.md`
- `README.es.md`
- `docs/es/architecture.md`
- `docs/es/configuration.md`
- `docs/es/integration-express.md`
- `docs/es/troubleshooting.md`
- `src/index.ts`
- `src/application/factory/logger.factory.ts`
- `src/infrastructure/services/datasource.service.ts`
- `src/domain/services/pii-redactor.service.ts`

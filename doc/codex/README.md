# Persistencia Codex

## Objetivo

`doc/codex` es la raiz documental persistente entre hilos de Codex para este repositorio. Su funcion es conservar contexto operativo, decisiones vigentes, estado actual e historial de cierres sin depender de memoria implicita del asistente ni del usuario.

Esta carpeta no reemplaza la documentacion funcional del paquete en `docs/`. `docs/` describe el producto; `doc/codex` conserva continuidad de trabajo entre hilos.

## Regla de alcance

La unica raiz valida para persistencia entre hilos en este proyecto es `doc/codex`.

Ningun hilo debe registrar continuidad operativa persistente fuera de esta carpeta.

## Orden de lectura recomendado

1. [project-context.md](./project-context.md)
2. [decisions.md](./decisions.md)
3. [current-state.md](./current-state.md)
4. Ultimo hilo enlazado desde `current-state.md`
5. Historial adicional en [threads/](./threads/)

## Regla sobre el ultimo hilo

`current-state.md` debe enlazar obligatoriamente el ultimo hilo generado en `doc/codex/threads`.

Si un hilo genera un cierre documental, debe actualizar tambien `current-state.md` para que ese enlace siga apuntando al cierre mas reciente.

## Estructura

- `project-context.md`: contexto estructural y tecnico del proyecto.
- `decisions.md`: normas operativas obligatorias para todos los hilos.
- `current-state.md`: estado vigente del trabajo y proxima accion recomendada.
- `thread-close-template.md`: plantilla oficial obligatoria de cierre.
- `threads/`: historial de cierres documentales por hilo.

## Referencias del producto

La documentacion tecnica del paquete vive en:

- `README.md`
- `README.es.md`
- `docs/es/`
- `docs/en/`

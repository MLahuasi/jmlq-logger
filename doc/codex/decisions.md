# Decisiones Operativas

Este archivo registra estandares obligatorios para cualquier hilo futuro que necesite persistencia documental en este repositorio.

## Decisiones vigentes

1. La persistencia entre hilos vive unicamente en `doc/codex`.
2. La documentacion funcional del producto puede seguir viviendo en `docs/`, `README.md` o `README.es.md`, pero no sustituye la persistencia operativa entre hilos.
3. Cuando se solicite "cierre y resumen del proceso", el hilo debe generar un archivo Markdown en `doc/codex/threads`.
4. Todo cierre documental debe usar como base `doc/codex/thread-close-template.md`.
5. El nombre del archivo de cierre debe seguir el formato `YYYYMMDDHHmm-tema.md`.
6. La hora usada en el nombre y en el encabezado del cierre debe estar en UTC-05, horario Ecuador.
7. Cuando se solicite el cierre, el hilo debe pedir siempre al usuario la hora antes de crear el archivo.
8. El numero de hilo es obligatorio en todo cierre documental.
9. `current-state.md` debe enlazar obligatoriamente el ultimo hilo generado.
10. Todo hilo que genere cierre debe actualizar `current-state.md` en la misma operacion.
11. Si existe una raiz documental publica distinta, se reutiliza para documentacion del producto, pero la continuidad entre hilos no debe dispersarse fuera de `doc/codex`.
12. Los cierres deben redactarse de forma concreta, verificable y util para que otro hilo pueda continuar el trabajo sin reconstruir contexto desde cero.

## Criterio de uso

Usar `doc/codex` para:

- estado vigente;
- decisiones persistentes;
- historial de cierres;
- referencias minimas para continuidad operativa.

No usar `doc/codex` para:

- duplicar manuales publicos ya mantenidos en `docs/`;
- copiar documentacion extensa del producto sin valor operativo;
- guardar notas temporales que no afecten continuidad entre hilos.

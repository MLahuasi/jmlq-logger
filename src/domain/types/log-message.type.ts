// Permite registrar distintos formatos de mensaje: string, object o función perezosa
export type LogMessage =
  | string
  | Record<string, unknown>
  | (() => string | Record<string, unknown>);

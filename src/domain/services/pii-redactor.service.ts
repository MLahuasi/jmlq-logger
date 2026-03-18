import { IPiiRedactor } from "../ports";
import { PiiOptions } from "../model";
import { toPiiRegex } from "../utils";

export class PiiRedactor implements IPiiRedactor {
  constructor(private props: PiiOptions = {}) {}

  updateOptions(opts: PiiOptions) {
    // merge superficial de opciones; no muta referencias externas
    this.props = { ...this.props, ...opts };
  }

  redact<T = unknown>(value: T): T {
    if (!this.props.enabled) return value; // early exit si PII apagado
    if (value == null) return value;

    // Si es string → aplicar patrones
    if (typeof value === "string") {
      return this.applyPatterns(value) as unknown as T;
    }

    // Si es objeto/array → redacción profunda si corresponde
    if (typeof value === "object") {
      return this.redactDeep(value) as T;
    }

    // Otros tipos (number, boolean, function) no se redactan
    return value;
  }

  private applyPatterns(input: string): string {
    const patterns = this.props.patterns ?? [];
    let out = input;
    for (const p of patterns) {
      const rx = toPiiRegex(p);
      // replace con patrón RegExp
      out = out.replace(rx, p.replaceWith);
    }
    return out;
  }

  private redactDeep<T extends object>(obj: T): T {
    // Evita mutar el objeto original → copia superficial
    const clone: any = Array.isArray(obj)
      ? [...(obj as any[])]
      : { ...(obj as Record<string, unknown>) };
    const { whitelistKeys = [], blacklistKeys = [], deep = true } = this.props;

    for (const key of Object.keys(clone)) {
      const val = clone[key];

      // Si está en whitelist, se respeta siempre
      if (whitelistKeys.includes(key)) continue;

      // Si está en blacklist y es string → reemplazar completamente
      if (blacklistKeys.includes(key)) {
        clone[key] = "[REDACTED]"; // fuerza redacción total de claves sensibles
        continue;
      }

      // Para strings comunes → aplicar patrones
      if (typeof val === "string") {
        clone[key] = this.applyPatterns(val);
        continue;
      }

      // Para objetos/arrays y deep===true → recursión
      if (deep && val && typeof val === "object") {
        clone[key] = this.redactDeep(val as any);
      }
    }

    return clone as T;
  }
}

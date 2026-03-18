import { PiiReplacementRule } from "../model";

// Convierte un patrón PII declarativo a un RegExp seguro
export function toPiiRegex(props: PiiReplacementRule): RegExp {
  try {
    return new RegExp(props.pattern, props.flags ?? "g");
  } catch {
    // fallback: RegExp imposible que nunca hace match
    return /$a/;
  }
}

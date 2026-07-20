/**
 * Una invariante de indexado (SEO/AEO) incumplida: la `rule` que falló y su `message`. Tipo compartido
 * por los checks del HTML SSR (`e2e/_utils/seo-invariants.ts`) y por la validación estructural de JSON-LD
 * (`json-ld-validation.ts`); vive acá, neutral, para que ambos lo consuman sin cruzar `src/` ↔ `e2e/`.
 */
export interface SeoInvariantViolation {
	readonly rule: string;
	readonly message: string;
}

import { DOCUMENT, Injectable, inject } from '@angular/core';

/** Forma serializable de un bloque JSON-LD de schema.org. */
export type JsonLdSchema = Record<string, unknown>;

/**
 * Ids de los bloques JSON-LD de página (los no-sitewide). Si una nueva ruta indexable emite
 * structured data propia, su id debe sumarse acá para que la home lo limpie al entrar.
 */
export const PAGE_SCOPED_SCHEMA_IDS = Object.freeze([
	'article',
	'breadcrumb-story',
	'profile-page',
	'breadcrumb-author',
	'collection',
	'breadcrumb-storylist',
] as const);

/**
 * Gestiona los bloques `<script type="application/ld+json">` del `<head>`.
 *
 * Inserta los bloques durante el SSR (usa `DOCUMENT`, no `window`) y es idempotente por `id`:
 * el app-shell renderiza `AppComponent` dos veces, así que reutilizar el mismo `<script>` por
 * `data-schema-id` evita duplicados tanto en SSR como tras la hidratación.
 */
@Injectable({ providedIn: 'root' })
export class SchemaOrgService {
	private readonly document = inject(DOCUMENT);

	/** Inserta o reemplaza (idempotente por `id`) un bloque JSON-LD en el `<head>`. */
	public setJsonLd(id: string, schema: JsonLdSchema): void {
		this.resolveScript(id).textContent = JSON.stringify(schema);
	}

	/**
	 * Quita el bloque JSON-LD identificado por `id`, si existe.
	 *
	 * Pensado para los schemas por página (Article/Person/Breadcrumb de #1521/#1522), que deben
	 * limpiarse al navegar fuera de la ruta; los schemas sitewide (Organization/WebSite) persisten.
	 */
	public removeJsonLd(id: string): void {
		this.findScript(id)?.remove();
	}

	public removePageScopedJsonLd(): void {
		for (const id of PAGE_SCOPED_SCHEMA_IDS) {
			this.removeJsonLd(id);
		}
	}

	private resolveScript(id: string): HTMLScriptElement {
		const existing = this.findScript(id);
		if (existing) {
			return existing;
		}
		const script = this.document.createElement('script');
		script.type = 'application/ld+json';
		script.setAttribute('data-schema-id', id);
		this.document.head.appendChild(script);
		return script;
	}

	private findScript(id: string): HTMLScriptElement | null {
		return this.document.head.querySelector<HTMLScriptElement>(`script[data-schema-id="${id}"]`);
	}
}

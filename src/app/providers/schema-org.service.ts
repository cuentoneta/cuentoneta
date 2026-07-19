import { DOCUMENT, Injectable, inject } from '@angular/core';
import { type Thing, type WithContext } from 'schema-dts';

/** Bloque JSON-LD top-level de schema.org (lleva `@context`), tipado por `schema-dts`. */
export type JsonLdSchema = WithContext<Thing>;

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

	/** Inserta o reemplaza (idempotente por `id`) un bloque JSON-LD sitewide, que persiste entre rutas. */
	public setJsonLd(id: string, schema: JsonLdSchema): void {
		this.writeScript(id, schema, 'sitewide');
	}

	/**
	 * Inserta o reemplaza un bloque JSON-LD de página, marcándolo con `data-schema-scope="page"`.
	 * El marcador permite que `removePageScopedJsonLd()` limpie todos los bloques de página al cambiar
	 * de ruta sin mantener a mano una lista de ids.
	 */
	public setPageScopedJsonLd(id: string, schema: JsonLdSchema): void {
		this.writeScript(id, schema, 'page');
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
		this.document.head.querySelectorAll('script[data-schema-scope="page"]').forEach((script) => script.remove());
	}

	private writeScript(id: string, schema: JsonLdSchema, scope: 'sitewide' | 'page'): void {
		const script = this.resolveScript(id);
		script.setAttribute('data-schema-scope', scope);
		script.textContent = JSON.stringify(schema);
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

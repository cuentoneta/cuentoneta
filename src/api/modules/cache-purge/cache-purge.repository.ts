import { invalidateByTag } from '@vercel/functions';

/**
 * Puerto de purga de caché de borde. Abstrae el mecanismo del proveedor (Vercel) del resto
 * del módulo, que solo conoce "purgar por tag".
 */
export interface CachePurgeRepository {
	purgeByTag(tag: string): Promise<void>;
}

// Costura de DI: la función real de purga se inyecta (default `invalidateByTag` de Vercel),
// para poder testear la delegación del adaptador sin module-mockear el SDK.
type PurgeByTagFn = (tag: string | string[]) => Promise<void>;

/**
 * Adaptador de Vercel: purga por tag vía `invalidateByTag` de `@vercel/functions`. Marca el
 * tag como stale y revalida en background; corriendo dentro de la función desplegada usa el
 * contexto de entorno de Vercel, sin token explícito (#1856 / docs de purge de Vercel).
 */
export class VercelCachePurgeRepository implements CachePurgeRepository {
	private readonly purge: PurgeByTagFn;

	constructor(purge: PurgeByTagFn = invalidateByTag) {
		this.purge = purge;
	}

	public async purgeByTag(tag: string): Promise<void> {
		await this.purge(tag);
	}
}

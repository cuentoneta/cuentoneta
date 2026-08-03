import { describe, expect, it } from 'vitest';
import { buildWeekSlug } from '@utils/week-slug.utils';

import { ACTIVE_LANDING_ID_QUERY, resolveActiveLandingId } from './landing-page';

// Doble escrito a mano en vez de vi.fn(): los wrappers de @test-utils viven en el árbol de la app y
// arrastrarlos acá sería acoplar dos proyectos pnpm por un caso que se resuelve con diez líneas.
class SpyGroqClient {
	query: string | null = null;
	params: Record<string, unknown> | null = null;

	constructor(private readonly result: unknown) {}

	fetch<T>(query: string, params?: Record<string, unknown>): Promise<T> {
		this.query = query;
		this.params = params ?? null;
		return this.result instanceof Error ? Promise.reject(this.result) : Promise.resolve(this.result as T);
	}
}

describe('resolveActiveLandingId', () => {
	it('queries the active landing with the ISO week of the given date', async () => {
		const client = new SpyGroqClient('landing-page-current');

		await resolveActiveLandingId(client, new Date(2025, 10, 14));

		expect(client.query).toBe(ACTIVE_LANDING_ID_QUERY);
		// El esperado se deriva de la implementación única del kernel, no de un literal: si el alias
		// @utils deja de resolver o la fórmula cambia, el fallo aparece acá y no recién en el Studio.
		expect(client.params).toEqual({ slug: buildWeekSlug(new Date(2025, 10, 14)) });
	});

	it('returns the id resolved by the client', async () => {
		const client = new SpyGroqClient('landing-page-current');

		await expect(resolveActiveLandingId(client, new Date(2025, 10, 14))).resolves.toBe('landing-page-current');
	});

	it('normalizes a missing result to null', async () => {
		const client = new SpyGroqClient(undefined);

		await expect(resolveActiveLandingId(client, new Date(2025, 10, 14))).resolves.toBeNull();
	});

	it('propagates a rejection from the client', async () => {
		// La propagación es contrato: quien la captura es el ítem de Desk Structure que la invoca.
		const client = new SpyGroqClient(new Error('GROQ no disponible'));

		await expect(resolveActiveLandingId(client, new Date(2025, 10, 14))).rejects.toThrow('GROQ no disponible');
	});
});

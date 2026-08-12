import { describe, expect, it } from 'vitest';
import { buildWeekSlug } from '@utils/week-slug.utils';

import { ACTIVE_LANDING_ID_QUERY, activeConfigOf, presentationOf, resolveActiveLandingId } from './landing-page';

// Doble escrito a mano en vez de vi.fn(): los wrappers de @test-utils viven en el árbol de la app y
// arrastrarlos acá sería acoplar dos proyectos pnpm por un caso que se resuelve con diez líneas.
class SpyGroqClient {
	public query: string | null = null;
	public params: Record<string, unknown> | null = null;

	constructor(private readonly result: unknown) {}

	public fetch<T>(query: string, params?: Record<string, unknown>): Promise<T> {
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
		expect(client.params).toEqual({ slug: '2025-46' });
	});

	it('falls back to the current date when none is given', async () => {
		// El único call site de producción (el ítem de Desk Structure) invoca sin fecha.
		const client = new SpyGroqClient('landing-page-current');

		await resolveActiveLandingId(client);

		expect(client.params).toEqual({ slug: buildWeekSlug(new Date()) });
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

describe('activeConfigOf', () => {
	const rows = [
		{ _id: 'a', config: '30-2026' },
		{ _id: 'b', config: '28-2026' },
	];

	it('toma el config de la fila activa', () => {
		expect(activeConfigOf(rows, 'b')).toBe('28-2026');
	});

	it('cae a la semana de la fecha dada cuando no hay activa', () => {
		// Sin referencia, toda fila posterior debe seguir leyéndose como futura y no como pasado.
		expect(activeConfigOf(rows, null, new Date(2025, 10, 14))).toBe(buildWeekSlug(new Date(2025, 10, 14)));
	});

	it('cae a la semana actual cuando el id activo no está entre las filas', () => {
		expect(activeConfigOf(rows, 'inexistente', new Date(2025, 10, 14))).toBe(buildWeekSlug(new Date(2025, 10, 14)));
	});
});

describe('presentationOf', () => {
	it('marca la activa con tono positivo', () => {
		expect(presentationOf({ _id: 'a', config: '28-2026' }, 'a', '28-2026')).toEqual({
			tone: 'positive',
			badge: 'Activa',
		});
	});

	it('marca como futura la fila cuyo config supera la referencia', () => {
		expect(presentationOf({ _id: 'b', config: '30-2026' }, 'a', '28-2026')).toEqual({
			tone: 'primary',
			badge: 'Futura',
		});
	});

	it('deja sin rótulo a la fila anterior a la referencia', () => {
		expect(presentationOf({ _id: 'c', config: '20-2026' }, 'a', '28-2026')).toEqual({
			tone: 'default',
			badge: null,
		});
	});

	it('no clasifica como futura a una fila que iguala la referencia sin ser la activa', () => {
		// El borde importa: dos landing pages con el mismo config, una activa y otra no.
		expect(presentationOf({ _id: 'd', config: '28-2026' }, 'a', '28-2026').badge).toBeNull();
	});
});

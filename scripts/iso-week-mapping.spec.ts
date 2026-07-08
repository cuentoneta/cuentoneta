import { describe, it, expect } from 'vitest';
import { collisionLosers, toIsoSlug } from './iso-week-mapping';
import type { MappedDoc } from './iso-week-mapping';

describe('iso-week-mapping', () => {
	describe('toIsoSlug', () => {
		it('mantiene el número cuando ISO y locale coinciden (rango 2025-2026)', () => {
			expect(toIsoSlug('2025-46')).toBe('2025-46');
			expect(toIsoSlug('2026-03')).toBe('2026-03');
		});

		it('recalcula la semana en los bordes de año donde ISO diverge del locale', () => {
			// 2021-01 (locale, domingo) cae en la semana ISO 53 de 2020; 2022-52 → ISO 2022-51.
			expect(toIsoSlug('2021-01')).toBe('2020-53');
			expect(toIsoSlug('2022-52')).toBe('2022-51');
		});

		it('devuelve null si el config no tiene formato YYYY-WW', () => {
			expect(toIsoSlug('nope')).toBeNull();
			expect(toIsoSlug('46-2025')).toBeNull();
		});
	});

	describe('collisionLosers', () => {
		const mapped = (id: string, config: string, iso: string): MappedDoc => ({
			id,
			logical: id.replace(/^drafts\./, ''),
			config,
			iso,
		});

		it('no reporta perdedores sin colisión (un solo doc lógico)', () => {
			expect(collisionLosers([mapped('a', '2026-03', '2026-03')])).toEqual([]);
		});

		it('no cuenta como colisión a un draft y su published del mismo documento', () => {
			const group = [mapped('a', '2021-01', '2020-53'), mapped('drafts.a', '2021-01', '2020-53')];
			expect(collisionLosers(group)).toEqual([]);
		});

		it('ante colisión gana el config locale mayor; el menor es el perdedor', () => {
			// 2020-53 y 2021-01 mapean ambos a 2020-53: gana 2021-01 (b), pierde 2020-53 (a).
			const group = [mapped('a', '2020-53', '2020-53'), mapped('b', '2021-01', '2020-53')];
			expect(collisionLosers(group)).toEqual(['a']);
		});
	});
});

import { describe, expect, it } from 'vitest';

import { resolveOgText } from './og-text';

describe('resolveOgText', () => {
	it('usa el nombre de la colección cuando viene provisto', () => {
		expect(resolveOgText({ collection: 'Cuentos de terror', author: 'Borges', title: 'El Fin' })).toBe(
			'Cuentos de terror',
		);
	});

	it('compone título y autor cuando no hay colección', () => {
		expect(resolveOgText({ author: 'Borges', title: 'El Fin' })).toBe('El Fin - Borges');
	});

	it('cae a la marca cuando falta alguno del par autor y título', () => {
		expect(resolveOgText({ title: 'El Fin' })).toBe('La Cuentoneta');
		expect(resolveOgText({ author: 'Borges' })).toBe('La Cuentoneta');
		expect(resolveOgText({})).toBe('La Cuentoneta');
	});

	it('trata un parámetro vacío como ausente', () => {
		expect(resolveOgText({ collection: '', author: 'Borges', title: 'El Fin' })).toBe('El Fin - Borges');
	});
});

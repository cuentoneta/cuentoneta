import { describe, expect, it } from 'vitest';

import { resolveOgText } from './og-text';

function readerOf(params: Record<string, string>) {
	return (name: string) => params[name];
}

describe('resolveOgText', () => {
	it('usa el nombre de la colección cuando viene provisto', () => {
		expect(resolveOgText(readerOf({ collection: 'Cuentos de terror', author: 'Borges', title: 'El Fin' }))).toBe(
			'Cuentos de terror',
		);
	});

	it('compone título y autor cuando no hay colección', () => {
		expect(resolveOgText(readerOf({ author: 'Borges', title: 'El Fin' }))).toBe('El Fin - Borges');
	});

	it('cae a la marca cuando falta alguno del par autor y título', () => {
		expect(resolveOgText(readerOf({ title: 'El Fin' }))).toBe('La Cuentoneta');
		expect(resolveOgText(readerOf({ author: 'Borges' }))).toBe('La Cuentoneta');
		expect(resolveOgText(readerOf({}))).toBe('La Cuentoneta');
	});

	it('trata un parámetro en blanco como ausente', () => {
		expect(resolveOgText(readerOf({ collection: '   ', author: 'Borges', title: 'El Fin' }))).toBe('El Fin - Borges');
		expect(resolveOgText(readerOf({ collection: '', author: '  ', title: 'El Fin' }))).toBe('La Cuentoneta');
	});

	it('recorta los espacios de los bordes del texto que resuelve', () => {
		expect(resolveOgText(readerOf({ author: '  Borges  ', title: '  El Fin  ' }))).toBe('El Fin - Borges');
	});

	it('escapa el markup del texto que resuelve', () => {
		const injected = '</p><img src="https://ejemplo.invalid/x.png" /><p>';

		expect(resolveOgText(readerOf({ collection: injected }))).not.toContain('<img');
		expect(resolveOgText(readerOf({ collection: '<b>&"\'' }))).toBe('&lt;b&gt;&amp;&quot;&#39;');
	});

	it('acota el largo del texto antes de escaparlo', () => {
		const long = 'a'.repeat(500);

		expect(resolveOgText(readerOf({ collection: long }))).toBe('a'.repeat(120));
	});
});

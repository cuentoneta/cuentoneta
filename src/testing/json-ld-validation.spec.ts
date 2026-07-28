import { assertValidJsonLd, validateJsonLd } from './json-ld-validation';

const VALID_ARTICLE = {
	'@context': 'https://schema.org',
	'@type': 'Article',
	headline: 'El Aleph',
	datePublished: '1945-09-01',
	author: { '@type': 'Person', name: 'Jorge Luis Borges', url: 'https://x/author/borges' },
	publisher: { '@type': 'Organization', name: 'La Cuentoneta', url: 'https://x' },
};

const VALID_BREADCRUMB = {
	'@context': 'https://schema.org',
	'@type': 'BreadcrumbList',
	itemListElement: [
		{ '@type': 'ListItem', position: 1, name: 'Inicio', item: { '@id': 'https://x/home' } },
		{ '@type': 'ListItem', position: 2, name: 'El Aleph', item: { '@id': 'https://x/story/el-aleph' } },
	],
};

describe('validateJsonLd', () => {
	it('no reporta violaciones para un Article válido', async () => {
		expect(await validateJsonLd(VALID_ARTICLE)).toEqual([]);
	});

	it('no reporta violaciones para un BreadcrumbList con item como IdReference', async () => {
		expect(await validateJsonLd(VALID_BREADCRUMB)).toEqual([]);
	});

	it('acepta un ListItem que identifica su destino con url (ItemList de colección)', async () => {
		const collection = {
			'@context': 'https://schema.org',
			'@type': 'CollectionPage',
			name: 'Verano 2022',
			url: 'https://x/storylist/verano-2022',
			mainEntity: {
				'@type': 'ItemList',
				itemListElement: [{ '@type': 'ListItem', position: 1, name: 'El Aleph', url: 'https://x/story/el-aleph' }],
			},
		};
		expect(await validateJsonLd(collection)).toEqual([]);
	});

	it('reporta una propiedad requerida faltante (Article sin datePublished)', async () => {
		const articleSinFecha = { ...VALID_ARTICLE, datePublished: undefined };
		const violations = await validateJsonLd(articleSinFecha);
		expect(violations.map((v) => v.message).join(' ')).toContain('datePublished');
	});

	it('reporta un @type desconocido (typo) del nodo raíz', async () => {
		const violations = await validateJsonLd({ ...VALID_ARTICLE, '@type': 'Articlee' });
		expect(violations.map((v) => v.message).join(' ')).toContain('Articlee');
	});

	it('reporta un @type roto en un nodo anidado (author con typo)', async () => {
		const violations = await validateJsonLd({
			...VALID_ARTICLE,
			author: { '@type': 'Persson', name: 'x' },
		});
		expect(violations.map((v) => v.message).join(' ')).toContain('Persson');
	});

	it('reporta un @context distinto de schema.org', async () => {
		const violations = await validateJsonLd({ ...VALID_ARTICLE, '@context': 'https://ejemplo.org' });
		expect(violations.map((v) => v.message).join(' ')).toContain('@context');
	});

	it('reporta un ListItem sin item ni url', async () => {
		const violations = await validateJsonLd({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio' }],
		});
		expect(violations.map((v) => v.message).join(' ')).toContain('item');
	});

	it('reporta cuando el bloque no es un objeto', async () => {
		expect(await validateJsonLd('no soy un objeto')).toHaveLength(1);
	});
});

describe('assertValidJsonLd', () => {
	it('resuelve para un bloque válido', async () => {
		await expect(assertValidJsonLd(VALID_ARTICLE)).resolves.toBeUndefined();
	});

	it('lanza con el detalle de las violaciones para un bloque inválido', async () => {
		await expect(assertValidJsonLd({ '@context': 'https://schema.org', '@type': 'Article' })).rejects.toThrow(
			/JSON-LD inválido/,
		);
	});
});

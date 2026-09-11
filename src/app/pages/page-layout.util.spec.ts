import { collectPageLayoutViolations } from './page-layout.util';

describe('collectPageLayoutViolations', () => {
	it('should accept a page that leaves the landmark and the clearance to the shell', () => {
		expect(collectPageLayoutViolations(`<div class="mx-auto flex w-full max-w-310 px-4 pt-8 pb-16"></div>`)).toEqual(
			[],
		);
	});

	it('should reject a page that declares its own main landmark', () => {
		expect(collectPageLayoutViolations(`<main class="w-full"></main>`)).toHaveLength(1);
		expect(collectPageLayoutViolations(`<main></main>`)).toHaveLength(1);
	});

	// El falso positivo más probable: `mainEntity` aparece en los datos estructurados de varias páginas.
	it('should not mistake an identifier that starts with "main" for the landmark', () => {
		expect(collectPageLayoutViolations(`const schema = { mainEntity: { '@type': 'Person' } };`)).toEqual([]);
		expect(collectPageLayoutViolations(`// el contenido principal de la página`)).toEqual([]);
	});

	it('should reject a page that clears the header on its own', () => {
		expect(collectPageLayoutViolations(`<div class="mx-auto mt-header-height flex"></div>`)).toHaveLength(1);
		expect(collectPageLayoutViolations(`<div class="pt-header-height"></div>`)).toHaveLength(1);
		expect(collectPageLayoutViolations(`<div class="md:mt-header-height"></div>`)).toHaveLength(1);
	});

	// El opt-out es la contracara del despeje y tiene que pasar.
	it('should allow the opt-out that cancels the clearance', () => {
		expect(collectPageLayoutViolations(`<article class="-mt-header-height"></article>`)).toEqual([]);
		expect(collectPageLayoutViolations(`<article class="md:-mt-header-height"></article>`)).toEqual([]);
		expect(collectPageLayoutViolations(`<article class="bleeds-under-header w-full"></article>`)).toEqual([]);
	});

	// El token se usa para otras cosas, y esas no son violaciones.
	it('should allow other uses of the header height token', () => {
		expect(collectPageLayoutViolations(`<aside class="lg:top-header-height sticky"></aside>`)).toEqual([]);
		expect(collectPageLayoutViolations(`<div class="h-header-height"></div>`)).toEqual([]);
	});

	it('should reject the retired shared spacing class', () => {
		expect(collectPageLayoutViolations(`<div class="content vertical-layout-spacing"></div>`)).toHaveLength(1);
	});

	it('should report every violation a page accumulates', () => {
		expect(collectPageLayoutViolations(`<main class="mt-header-height vertical-layout-spacing"></main>`)).toHaveLength(
			3,
		);
	});
});

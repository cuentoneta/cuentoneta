import {
	checkStoryDocs,
	extractMetaTitles,
	findDanglingKindIds,
	findDanglingNames,
	isDeclaredName,
	sanitizeStorybookTitle,
	STORY_DOC_PROSE_ALLOWLIST,
} from './check-story-docs';

describe('sanitizeStorybookTitle', () => {
	it('baja a minúsculas y convierte espacios, barras y puntuación en guiones', () => {
		expect(sanitizeStorybookTitle('Componentes V3/CollectionTeaserCard')).toBe('componentes-v3-collectionteasercard');
	});

	it('conserva los diacríticos en vez de transcribirlos', () => {
		expect(sanitizeStorybookTitle('Páginas/CollectionsPage')).toBe('páginas-collectionspage');
	});

	it('colapsa rachas de puntuación y recorta guiones de borde', () => {
		expect(sanitizeStorybookTitle('Book & Morfi: Especial')).toBe('book-morfi-especial');
	});
});

describe('extractMetaTitles', () => {
	it('lee el title del meta e ignora los title de los datos de cada story', () => {
		const content = [
			`const meta = { component: X, title: 'Componentes V3/Carousel' };`,
			`export default meta;`,
			`export const ConDatos = { args: { title: 'Geometrías del desvelo' } };`,
		].join('\n');

		expect(extractMetaTitles(content)).toEqual(['Componentes V3/Carousel']);
	});

	it('no confunde la clave title con sufijos como subtitle', () => {
		const content = [`const meta = { subtitle: 'Bajada', title: 'Componentes V3/Tag' };`, `export default meta;`].join(
			'\n',
		);

		expect(extractMetaTitles(content)).toEqual(['Componentes V3/Tag']);
	});
});

describe('isDeclaredName', () => {
	const declared = new Set(['CollectionCoverComponent', 'Collection', 'AuthorPage']);

	it('acepta el nombre exacto de una clase, un modelo o una página', () => {
		expect(isDeclaredName('Collection', declared)).toBe(true);
		expect(isDeclaredName('AuthorPage', declared)).toBe(true);
	});

	it('tolera que la prosa omita el sufijo de la clase', () => {
		expect(isDeclaredName('CollectionCover', declared)).toBe(true);
	});

	it('acepta la prosa legítima declarada en la allowlist', () => {
		expect(isDeclaredName('Páginas', declared)).toBe(true);
	});

	it('rechaza un componente borrado que ya no declara nadie', () => {
		expect(isDeclaredName('StorylistTeaserCard', declared)).toBe(false);
	});
});

describe('findDanglingNames', () => {
	const declared = new Set(['CollectionTeaserCard', 'Collection', 'CollectionCoverComponent']);

	it('marca un nombre colgado en la descripción del componente, con archivo y línea', () => {
		const content = `const meta = { parameters: { docs: { description: { component: \`<p>El <strong>StorylistTeaserCard</strong> viejo.</p>\` } } } };`;
		const problems = findDanglingNames('src/app/components/x/x.stories.ts', content, declared);

		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain('src/app/components/x/x.stories.ts:1');
		expect(problems[0]).toContain('StorylistTeaserCard');
	});

	it('acepta nombres declarados, con sufijo omitido, modelos y prosa allowlisteada', () => {
		const content = `component: \`<p><strong>CollectionTeaserCard</strong> sobre <strong>Collection</strong> con <strong>CollectionCover</strong> y <strong>Páginas</strong>.</p>\``;

		expect(findDanglingNames('x.stories.ts', content, declared)).toEqual([]);
	});

	it('ignora lo que no es referencia a código: minúsculas, HTML y prosa con puntuación', () => {
		const content = `component: \`<p><code>[innerHTML]</code> y <code>&lt;p&gt;</code> con <strong>Usos:</strong>.</p>\``;

		expect(findDanglingNames('x.stories.ts', content, declared)).toEqual([]);
	});

	it('no mira las descripciones de cada story, solo la del componente', () => {
		const content = `story: \`<p><strong>StorylistTeaserCard</strong> en showcase.</p>\``;

		expect(findDanglingNames('x.stories.ts', content, declared)).toEqual([]);
	});

	it('reporta la línea real cuando la prosa ocupa varias líneas', () => {
		const content = [
			`const meta = {`,
			`  parameters: {`,
			`    component: \`<p><strong>StorylistTeaserCard</strong></p>\`,`,
		].join('\n');
		const problems = findDanglingNames('x.stories.ts', content, declared);

		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain('x.stories.ts:3');
	});

	it('da el mismo resultado en corridas repetidas sobre patrones compartidos', () => {
		const content = `component: \`<p><strong>StorylistTeaserCard</strong></p>\``;

		expect(findDanglingNames('x.stories.ts', content, declared)).toEqual(
			findDanglingNames('x.stories.ts', content, declared),
		);
		expect(findDanglingNames('x.stories.ts', content, declared)).toHaveLength(1);
	});
});

describe('findDanglingKindIds', () => {
	const known = new Set(['componentes-v3-collectioncover', 'páginas-collectionspage']);

	it('marca un enlace roto con archivo, línea y el kind-id', () => {
		const content = `<a href="./?path=/docs/componentes-v3-inexistente--docs">ver</a>`;
		const problems = findDanglingKindIds('src/app/components/x/x.stories.ts', content, known);

		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain('src/app/components/x/x.stories.ts:1');
		expect(problems[0]).toContain('componentes-v3-inexistente');
	});

	it('acepta los kind-id que resuelven, con diacríticos incluidos', () => {
		const content = `<a href="./?path=/docs/componentes-v3-collectioncover--docs">a</a> <a href="./?path=/docs/páginas-collectionspage--docs">b</a>`;

		expect(findDanglingKindIds('x.stories.ts', content, known)).toEqual([]);
	});

	it('resuelve bien las líneas con terminaciones Windows', () => {
		const content = [`<p>primera</p>`, `<a href="./?path=/docs/componentes-v3-roto--docs">ver</a>`].join('\r\n');
		const problems = findDanglingKindIds('x.stories.ts', content, known);

		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain('x.stories.ts:2');
	});
});

describe('checkStoryDocs', () => {
	it('no encuentra nombres colgados ni enlaces rotos en el árbol del repo', () => {
		expect(checkStoryDocs()).toEqual([]);
	});
});

describe('STORY_DOC_PROSE_ALLOWLIST', () => {
	it('documenta el motivo de cada nombre en prosa declarado', () => {
		const entries = Object.entries(STORY_DOC_PROSE_ALLOWLIST);

		expect(entries.length).toBeGreaterThan(0);
		for (const [, reason] of entries) {
			expect(reason.trim().length).toBeGreaterThan(0);
		}
	});
});

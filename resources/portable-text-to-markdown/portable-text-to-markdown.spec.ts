import {
	portableTextToMarkdown,
	UnsupportedPortableTextError,
	type PortableTextBlock,
} from './portable-text-to-markdown';

function block(children: PortableTextBlock['children'], overrides: Partial<PortableTextBlock> = {}): PortableTextBlock {
	return { _type: 'block', _key: 'b1', style: 'normal', markDefs: [], children, ...overrides };
}

function span(text: string, marks: string[] = []): NonNullable<PortableTextBlock['children']>[number] {
	return { _type: 'span', _key: 's1', text, marks };
}

describe('portableTextToMarkdown', () => {
	describe('lo que el dataset usa hoy', () => {
		it('convierte un párrafo plano a texto plano', () => {
			expect(portableTextToMarkdown([block([span('Grabación casera, 1974.')])])).toBe('Grabación casera, 1974.');
		});

		it('convierte el énfasis a asteriscos simples', () => {
			expect(portableTextToMarkdown([block([span('cuaderno de 1971', ['em'])])])).toBe('*cuaderno de 1971*');
		});

		it('convierte la negrita a asteriscos dobles', () => {
			expect(portableTextToMarkdown([block([span('podcast', ['strong'])])])).toBe('**podcast**');
		});

		it('deja el espacio de los bordes fuera de los delimitadores', () => {
			// CommonMark no cierra un énfasis cuyo delimitador viene precedido de espacio: dentro, la marca
			// se perdería en silencio.
			expect(portableTextToMarkdown([block([span('Elsa Bornemann ', ['strong']), span('(1952)')])])).toBe(
				'**Elsa Bornemann** (1952)',
			);
		});

		it('no envuelve en delimitadores un span que solo tiene espacios', () => {
			expect(portableTextToMarkdown([block([span('a', ['em']), span(' ', ['em']), span('b', ['em'])])])).toBe(
				'*a* *b*',
			);
		});

		it('convierte un enlace resolviendo su href desde markDefs', () => {
			const withLink = block([span('edición facsimilar', ['link-1'])], {
				markDefs: [{ _type: 'link', _key: 'link-1', href: 'https://example.org/a.pdf' }],
			});

			expect(portableTextToMarkdown([withLink])).toBe('[edición facsimilar](https://example.org/a.pdf)');
		});

		it('concatena los spans de un mismo párrafo sin separador', () => {
			const mixed = block([span('Análisis en formato '), span('podcast', ['strong']), span('.')]);

			expect(portableTextToMarkdown([mixed])).toBe('Análisis en formato **podcast**.');
		});

		it('separa párrafos con una línea en blanco', () => {
			const first = block([span('Primero.')], { _key: 'b1' });
			const second = block([span('Segundo.')], { _key: 'b2' });

			expect(portableTextToMarkdown([first, second])).toBe('Primero.\n\nSegundo.');
		});

		// El enlace envuelve al énfasis y no al revés: deja el marcado del enlace afuera, que se lee mejor
		// en el editor del CMS, que es donde alguien va a mantener este texto después de migrado.
		it('anida el enlace por fuera del énfasis cuando el span tiene ambos', () => {
			const both = block([span('Le Ble Chateau', ['em', 'link-1'])], {
				markDefs: [{ _type: 'link', _key: 'link-1', href: 'https://example.org' }],
			});

			expect(portableTextToMarkdown([both])).toBe('[*Le Ble Chateau*](https://example.org)');
		});

		it('descarta los párrafos vacíos en vez de emitir líneas en blanco de más', () => {
			const withEmpty = [block([span('Único.')], { _key: 'b1' }), block([span('')], { _key: 'b2' })];

			expect(portableTextToMarkdown(withEmpty)).toBe('Único.');
		});

		// Un bloque en blanco no es una cadena vacía: si se colara, el resultado tendría texto solo en
		// apariencia y el guard de vacío de las migraciones lo dejaría pasar.
		it('descarta también los párrafos que solo tienen espacios', () => {
			const withBlank = [block([span('Único.')], { _key: 'b1' }), block([span('   ', ['em'])], { _key: 'b2' })];

			expect(portableTextToMarkdown(withBlank)).toBe('Único.');
		});

		it('devuelve una cadena vacía cuando todos los párrafos están en blanco', () => {
			expect(portableTextToMarkdown([block([span(' '), span('\t')])])).toBe('');
		});

		it('devuelve una cadena vacía para una entrada vacía', () => {
			expect(portableTextToMarkdown([])).toBe('');
		});
	});

	describe('escapado', () => {
		// Sin escapar, un asterisco del texto original se volvería marcado al releer el Markdown.
		it('escapa los caracteres que Markdown interpretaría como marcado', () => {
			expect(portableTextToMarkdown([block([span('Un 5 * 3 y un _guion_ y un [corchete]')])])).toBe(
				'Un 5 \\* 3 y un \\_guion\\_ y un \\[corchete\\]',
			);
		});

		it('escapa la barra invertida antes que el resto, para no romper el propio escapado', () => {
			expect(portableTextToMarkdown([block([span('C:\\ruta')])])).toBe('C:\\\\ruta');
		});
	});

	// La regla de diseño: una construcción que el conversor no sabe traducir detiene la migración en vez
	// de perderse en silencio. El dato original no se recupera, así que fallar es la opción conservadora.
	describe('construcciones no soportadas', () => {
		it('rechaza un bloque que no sea de tipo block', () => {
			expect(() => portableTextToMarkdown([{ _type: 'image', _key: 'img1' }])).toThrow(UnsupportedPortableTextError);
		});

		it('rechaza un estilo que no sea normal', () => {
			expect(() => portableTextToMarkdown([block([span('Cita')], { style: 'blockquote' })])).toThrow(
				/Estilo no soportado: "blockquote"/,
			);
		});

		it('rechaza las listas', () => {
			expect(() => portableTextToMarkdown([block([span('Ítem')], { listItem: 'bullet' })])).toThrow(
				/Listas no soportadas/,
			);
		});

		it('rechaza un markDef que no sea un enlace', () => {
			const withFootnote = block([span('texto')], { markDefs: [{ _type: 'footnote', _key: 'f1' }] });

			expect(() => portableTextToMarkdown([withFootnote])).toThrow(/markDef no soportado: "footnote"/);
		});

		// Una marca que no es `em`/`strong` solo puede ser la clave de un markDef. Si no la resuelve
		// ninguno, el dato está corrupto y traducirlo como texto plano perdería el enlace sin avisar.
		it('rechaza una marca que ningún markDef resuelve', () => {
			expect(() => portableTextToMarkdown([block([span('texto', ['huerfana'])])])).toThrow(
				/Marca sin markDef de enlace que la resuelva: "huerfana"/,
			);
		});

		it('identifica el bloque en el mensaje del error', () => {
			expect(() => portableTextToMarkdown([block([span('Cita')], { style: 'h2', _key: 'bloque-7' })])).toThrow(
				/bloque "bloque-7"/,
			);
		});
	});
});

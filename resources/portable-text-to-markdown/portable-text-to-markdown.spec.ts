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

		// Un destino sin delimitar termina en el primer paréntesis que cierra: el enlace queda truncado
		// y el resto de la URL se derrama como texto visible. Pasa en 20 obras del corpus, con
		// fragmentos `#:~:text=…` que llevan paréntesis adentro.
		it('delimita con <> el destino que lleva paréntesis o espacios', () => {
			const href = 'https://example.org/d.pdf#:~:text=algo,26/03/1976).%20El%20diario';
			const withTrickyLink = block([span('Mayoría', ['link-1'])], {
				markDefs: [{ _type: 'link', _key: 'link-1', href }],
			});

			expect(portableTextToMarkdown([withTrickyLink])).toBe(`[Mayoría](<${href}>)`);
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

		it('rechaza un estilo que no traduce', () => {
			expect(() => portableTextToMarkdown([block([span('Texto')], { style: 'inventado' })])).toThrow(
				/Estilo no soportado: "inventado"/,
			);
		});

		it('rechaza un tipo de lista que no traduce', () => {
			expect(() => portableTextToMarkdown([block([span('Ítem')], { listItem: 'checkbox' })])).toThrow(
				/Lista no soportada: "checkbox"/,
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
			expect(() => portableTextToMarkdown([block([span('Cita')], { style: 'inventado', _key: 'bloque-7' })])).toThrow(
				/bloque "bloque-7"/,
			);
		});
	});

	// Construcciones incorporadas para la migración de Story a LiteraryWork, a partir del censo del
	// corpus: encabezados, citas, listas, separadores de escena y los decoradores de alineación.
	describe('encabezados', () => {
		it('traduce cada nivel a sus almohadillas', () => {
			for (const [style, expected] of [
				['h1', '# Título'],
				['h3', '### Título'],
				['h6', '###### Título'],
			] as const) {
				expect(portableTextToMarkdown([block([span('Título')], { style })])).toBe(expected);
			}
		});

		it('conserva el énfasis dentro del encabezado', () => {
			expect(portableTextToMarkdown([block([span('Parte', ['strong'])], { style: 'h2' })])).toBe('## **Parte**');
		});
	});

	describe('citas', () => {
		it('antepone el marcador de cita', () => {
			expect(portableTextToMarkdown([block([span('Citado')], { style: 'blockquote' })])).toBe('> Citado');
		});
	});

	describe('listas', () => {
		it('traduce viñetas y numeración', () => {
			expect(portableTextToMarkdown([block([span('Uno')], { listItem: 'bullet' })])).toBe('- Uno');
			expect(portableTextToMarkdown([block([span('Uno')], { listItem: 'number' })])).toBe('1. Uno');
		});

		// Separar dos ítems con línea en blanco produce una lista "suelta", que CommonMark envuelve en
		// un párrafo dentro de cada ítem — otro HTML del que rinde el original.
		it('une los ítems consecutivos con un solo salto', () => {
			const items = [block([span('Uno')], { listItem: 'bullet' }), block([span('Dos')], { listItem: 'bullet' })];

			expect(portableTextToMarkdown(items)).toBe('- Uno\n- Dos');
		});

		it('vuelve a separar con línea en blanco cuando la lista termina', () => {
			const blocks = [block([span('Uno')], { listItem: 'bullet' }), block([span('Después')])];

			expect(portableTextToMarkdown(blocks)).toBe('- Uno\n\nDespués');
		});
	});

	// El corpus escribe los separadores de escena como una tirada de asteriscos o guiones, centrada,
	// porque el editor viejo no tenía un separador propio. Markdown sí lo tiene.
	describe('separadores de escena', () => {
		it('traduce una tirada de asteriscos o guiones al separador temático', () => {
			for (const separator of ['***', '**********', '---', '___']) {
				expect(portableTextToMarkdown([block([span(separator)])])).toBe('---');
			}
		});

		it('no confunde prosa que empieza con un asterisco', () => {
			expect(portableTextToMarkdown([block([span('*Nota* al pie')])])).toBe('\\*Nota\\* al pie');
		});
	});

	// El diálogo en español abre con guion. Sin escape, Markdown lee ese párrafo como ítem de lista:
	// el guion desaparece y el texto queda envuelto en <ul>. Son 120 párrafos en 5 obras del corpus.
	describe('párrafos que arrancan con un marcador de lista', () => {
		it('escapa el guion del diálogo', () => {
			expect(portableTextToMarkdown([block([span('- ¿Cómo te va?')])])).toBe('\\- ¿Cómo te va?');
		});

		// En la lista numerada se escapa el signo, no el dígito: CommonMark solo reconoce el escape sobre
		// puntuación ASCII, así que `\1.` dejaría la barra invertida a la vista del lector.
		it('escapa también los otros marcadores que Markdown reconoce', () => {
			for (const [texto, esperado] of [
				['+ suma', '\\+ suma'],
				['> cita', '\\> cita'],
				['1. primero', '1\\. primero'],
				['2) segundo', '2\\) segundo'],
			] as const) {
				expect(portableTextToMarkdown([block([span(texto)])])).toBe(esperado);
			}
		});

		// El corpus guarda saltos de línea dentro del texto de un mismo span, así que un marcador puede
		// quedar al inicio de una línea que no es la primera del bloque.
		it('escapa el marcador que aparece tras un salto de línea interno', () => {
			expect(portableTextToMarkdown([block([span('Dos cosas:\n1. Que sí')])])).toBe('Dos cosas:\n1\\. Que sí');
		});

		it('no escapa un guion que no abre el párrafo', () => {
			expect(portableTextToMarkdown([block([span('Dijo -y se fue- que sí')])])).toBe('Dijo -y se fue- que sí');
		});

		// Un bloque que ya lleva marcador propio no necesita el escape: su prefijo abre la línea.
		it('no escapa dentro de un ítem de lista real', () => {
			expect(portableTextToMarkdown([block([span('- anidado')], { listItem: 'bullet' })])).toBe('- - anidado');
		});
	});

	// Markdown no tiene alineación y el pipeline de la app descarta el HTML crudo: emitir un
	// `<p align="center">` no perdería el centrado, perdería el texto entero.
	describe('decoradores de alineación', () => {
		it('conserva el texto e ignora la marca', () => {
			for (const alignment of ['left', 'center', 'right', 'justify']) {
				expect(portableTextToMarkdown([block([span('Centrado', [alignment])])])).toBe('Centrado');
			}
		});

		it('conserva el énfasis que acompaña a la alineación', () => {
			expect(portableTextToMarkdown([block([span('Firma', ['center', 'em'])])])).toBe('*Firma*');
		});
	});
});

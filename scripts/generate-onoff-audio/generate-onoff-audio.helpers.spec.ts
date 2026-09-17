import { encodeArgs, selectExcerpt, synthesisScript } from './generate-onoff-audio.helpers';

describe('selectExcerpt', () => {
	it('devuelve prosa plana, sin sintaxis de Markdown', () => {
		const markdown = 'Un **peldaño** más, y la _diagonal exacta_ del [marco](https://example.org/x).';

		expect(selectExcerpt(markdown, { maxWords: 40 })).toBe('Un peldaño más, y la diagonal exacta del marco.');
	});

	it('descarta las citas del film, que el corpus marca entrecomillando', () => {
		const markdown = 'La escalera tenía trece tramos. "El regreso del druso", dijo ella. Nadie tocó la baranda.';

		expect(selectExcerpt(markdown, { maxWords: 40 })).toBe('La escalera tenía trece tramos. Nadie tocó la baranda.');
	});

	it('descarta las líneas de cita en bloque y los encabezados', () => {
		const markdown = '# Geometría\n\n> Bando de la primera frontera.\n\nShannon abre los ojos.';

		expect(selectExcerpt(markdown, { maxWords: 40 })).toBe('Shannon abre los ojos.');
	});

	it('corta en un límite de oración, sin exceder el presupuesto de palabras', () => {
		const markdown = 'Uno dos tres. Cuatro cinco seis. Siete ocho nueve.';

		expect(selectExcerpt(markdown, { maxWords: 6 })).toBe('Uno dos tres. Cuatro cinco seis.');
	});

	it('devuelve la primera oración aunque por sí sola exceda el presupuesto', () => {
		const markdown = 'Uno dos tres cuatro cinco. Seis siete.';

		expect(selectExcerpt(markdown, { maxWords: 2 })).toBe('Uno dos tres cuatro cinco.');
	});

	it('no corta en el punto de una abreviatura', () => {
		const markdown = 'La Sra. Oneiras bajó los trece tramos. Nadie la siguió.';

		expect(selectExcerpt(markdown, { maxWords: 8 })).toBe('La Sra. Oneiras bajó los trece tramos.');
	});

	it('empieza más adelante cuando se le pide saltear oraciones', () => {
		const markdown = 'Uno. Dos. Tres.';

		expect(selectExcerpt(markdown, { maxWords: 40, skipSentences: 2 })).toBe('Tres.');
	});

	it('devuelve cadena vacía cuando no queda prosa propia', () => {
		expect(selectExcerpt('"Todo esto es del film."', { maxWords: 40 })).toBe('');
	});
});

describe('synthesisScript', () => {
	const script = synthesisScript({ textFile: "C:\\tmp\\o'neiras.txt", wavFile: 'C:\\tmp\\x.wav' });

	it('elige la voz por cultura, no por nombre', () => {
		expect(script).toContain("TwoLetterISOLanguageName -eq 'es'");
		expect(script).toContain('Select-Object -First 1');
	});

	it('aborta si no hay ninguna voz en español, en vez de leer con acento ajeno', () => {
		expect(script).toContain('if ($null -eq $voice)');
		expect(script).toContain('exit 1');
	});

	it('lee el texto del archivo, para que la prosa acentuada no pase por la línea de comandos', () => {
		expect(script).toContain('[IO.File]::ReadAllText');
		expect(script).not.toContain('-Command');
	});

	it('escapa las comillas de una ruta, que de otro modo cerrarían el literal', () => {
		expect(script).toContain("'C:\\tmp\\o''neiras.txt'");
	});
});

describe('encodeArgs', () => {
	const args = encodeArgs({ wavFile: 'in.wav', oggFile: 'out.ogg', maxSeconds: 20 });

	it('corta duro en el máximo, que es la garantía de peso del corpus', () => {
		expect(args).toContain('-t');
		expect(args[args.indexOf('-t') + 1]).toBe('20');
	});

	it('funde la salida para que el corte no termine en un clic', () => {
		expect(args).toContain('afade=t=out:st=19:d=1');
	});

	it('encodea a Vorbis mono y deja el destino al final', () => {
		expect(args).toContain('libvorbis');
		expect(args[args.indexOf('-ac') + 1]).toBe('1');
		expect(args.at(-1)).toBe('out.ogg');
	});
});

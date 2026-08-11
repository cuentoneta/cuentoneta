import { buildSubstitutionTable, emitModule, type Substitution } from './generate-raw-corpus.emitter';

const prose: Substitution = { binding: 'geometriaMdBody', specifier: './geometria.md?raw', kind: 'default' };
const tag: Substitution = { binding: 'cuentoRawTag', specifier: '../../onoff-raw-tags.mock', kind: 'named' };

function emit(value: unknown, entries: { value: unknown; substitution: Substitution }[] = []) {
	return emitModule({
		banner: '// generado',
		exportName: 'fixture',
		typeImport: 'Fixture',
		typeAnnotation: 'Fixture',
		typeSpecifier: '@sanity-types',
		value,
		table: buildSubstitutionTable(entries),
	});
}

describe('emitModule', () => {
	it('emits the banner, the type import and the export', () => {
		const output = emit({ slug: 'geometria' });

		expect(output).toContain('// generado');
		expect(output).toContain("import type { Fixture } from '@sanity-types';");
		expect(output).toContain(`export const fixture: Fixture = {slug:"geometria"};`);
	});

	// Sin esto, cada obra generada duplicaría en git los ~3 KB de su prosa, y cualquier diff sobre el
	// corpus quedaría ahogado en texto que no cambió.
	it('replaces a prose string with its default import', () => {
		const output = emit({ body: 'Un cuerpo largo' }, [{ value: 'Un cuerpo largo', substitution: prose }]);

		expect(output).toContain("import geometriaMdBody from './geometria.md?raw';");
		expect(output).toContain('body:geometriaMdBody');
		expect(output).not.toContain('Un cuerpo largo');
	});

	// La sustitución es por valor serializado, así que cubre un objeto entero igual que un string: las
	// etiquetas y el autor son piezas a mano que el generado tiene que seguir importando.
	it('replaces a whole object with its named import', () => {
		const raw = { title: 'Cuento', slug: 'cuento', description: null };
		const output = emit({ tags: [raw] }, [{ value: raw, substitution: tag }]);

		expect(output).toContain("import { cuentoRawTag } from '../../onoff-raw-tags.mock';");
		expect(output).toContain('tags:[cuentoRawTag]');
	});

	it('leaves a string that only resembles the substituted one', () => {
		const output = emit({ body: 'Un cuerpo largo.' }, [{ value: 'Un cuerpo largo', substitution: prose }]);

		expect(output).toContain(`body:"Un cuerpo largo."`);
		expect(output).not.toContain('geometriaMdBody');
	});

	it('imports a binding once even when the value repeats', () => {
		const output = emit({ first: 'Un cuerpo largo', second: 'Un cuerpo largo' }, [
			{ value: 'Un cuerpo largo', substitution: prose },
		]);

		expect(output.match(/import geometriaMdBody/g)).toHaveLength(1);
	});

	it('groups the bindings that share a specifier, sorted', () => {
		const otro: Substitution = { binding: 'amorRawTag', specifier: '../../onoff-raw-tags.mock', kind: 'named' };
		const output = emit({ tags: ['uno', 'dos'] }, [
			{ value: 'uno', substitution: tag },
			{ value: 'dos', substitution: otro },
		]);

		expect(output).toContain("import { amorRawTag, cuentoRawTag } from '../../onoff-raw-tags.mock';");
	});

	it('omits an import nobody used', () => {
		const output = emit({ slug: 'geometria' }, [{ value: 'otra cosa', substitution: prose }]);

		expect(output).not.toContain('geometria.md?raw');
	});

	it('emits nulls, empty arrays and nesting as the query returns them', () => {
		const output = emit({ editorialNote: null, resources: [], content: [{ epigraphs: [{ text: 'A' }] }] });

		expect(output).toContain('editorialNote:null');
		expect(output).toContain('resources:[]');
		expect(output).toContain(`content:[{epigraphs:[{text:"A"}]}]`);
	});

	// GROQ produce claves con alias entre comillas, que no siempre son identificadores válidos.
	it('quotes a key that is not a plain identifier', () => {
		const output = emit({ 'audio-url': 'x' });

		expect(output).toContain(`"audio-url":"x"`);
	});

	// La prosa del corpus viene con CRLF. Un `\r` sin escapar termina el literal igual que un `\n`, y el
	// archivo generado deja de parsear.
	it('escapes the line terminators the corpus prose carries, CR included', () => {
		const output = emit({ title: 'El odio\r\ncontinúa' });

		expect(output).toContain(String.raw`title:"El odio\r\ncontinúa"`);
		expect(output).not.toMatch(/[\r\n]continúa/);
	});
});

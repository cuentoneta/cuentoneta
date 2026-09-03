import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { FIELD_SHAPES, WATCHED_FIELDS } from './field-shape-sweep.fields';

const SCHEMAS_DIR = join(process.cwd(), 'cms/schemas');

describe('WATCHED_FIELDS', () => {
	// La tabla va a mano porque el schema versionado colapsa `datetime` a `string`. Sin este caso, una
	// entrada con un tipo mal escrito llegaría al constructor de queries y fallaría recién en la corrida.
	it('declara una forma conocida en cada entrada', () => {
		const shapes = Object.values(FIELD_SHAPES);

		WATCHED_FIELDS.forEach((field) => expect(shapes).toContain(field.shape));
	});

	it('no repite un campo', () => {
		const labels = WATCHED_FIELDS.map((field) => `${field.documentType}.${field.path}`);

		expect(new Set(labels).size).toBe(labels.length);
	});

	// La tabla va a mano, así que un campo declarado mañana no entra solo: eso es justamente el punto
	// ciego que el barrido acepta. Este caso lo vuelve ruidoso — lee los schemas del Studio, que sí
	// distinguen la fecha con hora, y exige que cada uno tenga su entrada.
	it('cubre todos los campos que el Studio declara con fecha y hora', () => {
		const declared = readdirSync(SCHEMAS_DIR)
			.filter((file) => file.endsWith('.ts'))
			.flatMap((file) => {
				const documentType = file.slice(0, -'.ts'.length);
				// Un campo por bloque `defineField`: buscar el `name:` más cercano con una ventana de caracteres
				// toma el del campo anterior cuando el de la fecha trae título y descripción largos.
				return readFileSync(join(SCHEMAS_DIR, file), 'utf8')
					.split('defineField(')
					.filter((block) => block.includes("type: 'datetime'"))
					.map((block) => block.match(/name: '([A-Za-z_]\w*)'/)?.[1])
					.filter((name): name is string => Boolean(name))
					.map((name) => `${documentType}.${name}`);
			});

		expect(declared.length).toBeGreaterThan(0);
		expect(WATCHED_FIELDS.map((field) => `${field.documentType}.${field.path}`).sort()).toEqual(declared.sort());
	});
});

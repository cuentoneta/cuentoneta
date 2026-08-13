import { describe, expect, it } from 'vitest';

import collection from './collection';

// El tipo nace de un traspaso desde `storylist`, y las tres diferencias que lo separan de su origen
// son decisiones de dominio, no detalles de forma: sin pestañas, la descripción en Markdown y las
// obras literarias en lugar de las historias. Un cambio que las revierta rompe la migración que
// construye estos documentos y el ACL que los lee, así que se afirman acá y no en ningún otro lado.
// El resto de los campos no se re-declara: un test que enumere el schema entero solo duplica su fuente.

type SchemaField = { name: string; type: string; validation?: unknown; of?: Array<Record<string, unknown>> };

const fields = collection.fields as unknown as SchemaField[];
const fieldNamed = (name: string) => fields.find((field) => field.name === name);

describe('schema collection', () => {
	it('does not declare the tabs of its origin type', () => {
		expect(fieldNamed('tabs')).toBeUndefined();
	});

	it('takes the description as Markdown and requires it', () => {
		const description = fieldNamed('description');

		expect(description?.type).toBe('markdown');
		expect(description?.validation).toBeDefined();
	});

	it('aggregates literary works instead of stories', () => {
		const literaryWorks = fieldNamed('literaryWorks');

		expect(literaryWorks?.type).toBe('array');
		expect(literaryWorks?.of?.[0]).toMatchObject({ type: 'reference', to: [{ type: 'literaryWork' }] });
		expect(fieldNamed('stories')).toBeUndefined();
	});
});

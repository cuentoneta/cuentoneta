import { describe, expect, it } from 'vitest';

import collection from './collection';

// Tres rasgos del tipo son decisiones de dominio y no detalles de forma: la colección no estructura su
// contenido en pestañas, su descripción es Markdown y agrupa obras literarias por referencia. Un cambio
// que los revierta rompe la migración que construye estos documentos y el ACL que los lee, así que se
// afirman acá y no en ningún otro lado. La ausencia de `tabs` y de `stories` se afirma explícitamente
// porque el contenido de estos documentos llegó traspasado de un tipo que sí los declaraba, y volver a
// declararlos partiría en dos la forma que el ACL espera.
// El resto de los campos no se re-declara: un test que enumere el schema entero solo duplica su fuente.

type SchemaField = { name: string; type: string; validation?: unknown; of?: Array<Record<string, unknown>> };

const fields = collection.fields as unknown as SchemaField[];
const fieldNamed = (name: string) => fields.find((field) => field.name === name);

describe('schema collection', () => {
	it('does not structure its content in tabs', () => {
		expect(fieldNamed('tabs')).toBeUndefined();
	});

	it('takes the description as Markdown and requires it', () => {
		const description = fieldNamed('description');

		expect(description?.type).toBe('markdown');
		expect(description?.validation).toBeDefined();
	});

	it('aggregates literary works by reference, and nothing else', () => {
		const literaryWorks = fieldNamed('literaryWorks');

		expect(literaryWorks?.type).toBe('array');
		expect(literaryWorks?.of?.[0]).toMatchObject({ type: 'reference', to: [{ type: 'literaryWork' }] });
		expect(fieldNamed('stories')).toBeUndefined();
	});
});

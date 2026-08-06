import type { FieldDefinition, Rule } from 'sanity';
import { describe, expect, it } from 'vitest';

import collection from './collection';
import schemas from './schema';

// `validation` no es un valor sino un builder: la regla que aplica solo se observa invocándolo. El
// doble registra lo que le piden, y se devuelve a sí mismo para admitir el encadenado que la API usa.
class SpyRule {
	public readonly calls: string[] = [];

	public required(): this {
		this.calls.push('required');
		return this;
	}
}

function fieldNamed(name: string): FieldDefinition | undefined {
	return collection.fields.find((field) => field.name === name);
}

function rulesAppliedTo(field: FieldDefinition): string[] {
	const rule = new SpyRule();
	const { validation } = field;
	expect(typeof validation).toBe('function');
	(validation as (rule: Rule) => unknown)(rule as unknown as Rule);
	return rule.calls;
}

describe('document type collection', () => {
	it('queda registrado en el Studio', () => {
		expect(collection.name).toBe('collection');
		expect(schemas).toContain(collection);
	});

	// El diseño de la página no las contempla, y ninguna storylist tiene contenido cargado en ellas.
	it('no declara pestañas', () => {
		expect(fieldNamed('tabs')).toBeUndefined();
	});

	// Lo que saca a este tipo del pipeline de Portable Text.
	it('declara la descripción en Markdown y la exige', () => {
		const description = fieldNamed('description');

		expect(description?.type).toBe('markdown');
		expect(rulesAppliedTo(description as FieldDefinition)).toContain('required');
	});

	// Una colección agrega obras literarias: es la razón de ser del agregado, no un campo más.
	it('agrega obras literarias y no historias', () => {
		const literaryWorks = fieldNamed('literaryWorks');

		expect(literaryWorks?.type).toBe('array');
		expect((literaryWorks as { of: unknown[] }).of[0]).toMatchObject({
			type: 'reference',
			to: [{ type: 'literaryWork' }],
		});
		expect(fieldNamed('stories')).toBeUndefined();
	});
});

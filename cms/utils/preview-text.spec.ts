import { describe, expect, it } from 'vitest';

import { toPlainText } from './preview-text';

describe('toPlainText', () => {
	it('joins every span of every block', () => {
		// Un texto con una palabra en negrita se parte en varios spans. Antes se tomaba solo el primero,
		// así que el preview del epígrafe se cortaba en la negrita.
		expect(toPlainText([{ children: [{ text: 'Un cuento ' }, { text: 'muy' }, { text: ' breve' }] }])).toBe(
			'Un cuento muy breve',
		);
	});

	it('concatenates consecutive blocks', () => {
		expect(toPlainText([{ children: [{ text: 'Primero. ' }] }, { children: [{ text: 'Segundo.' }] }])).toBe(
			'Primero. Segundo.',
		);
	});

	it('returns an empty string when there is nothing loaded yet', () => {
		expect(toPlainText(undefined)).toBe('');
		expect(toPlainText([])).toBe('');
	});

	it('tolerates blocks the editor left half-written', () => {
		expect(toPlainText([{}, { children: [] }, { children: [{}] }])).toBe('');
	});
});

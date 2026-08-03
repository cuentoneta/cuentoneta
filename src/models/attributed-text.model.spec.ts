import { createAttributedText } from './attributed-text.model';
import { createSanitizedHtml } from './sanitized-html.model';

describe('createAttributedText', () => {
	it('builds a frozen value from sanitized text and reference', () => {
		const attributedText = createAttributedText({
			text: createSanitizedHtml('<p>Y si el alma te pesa…</p>'),
			reference: createSanitizedHtml('<p>Rafael Obligado</p>'),
		});

		expect(attributedText.text).toBe('<p>Y si el alma te pesa…</p>');
		expect(attributedText.reference).toBe('<p>Rafael Obligado</p>');
		expect(Object.isFrozen(attributedText)).toBe(true);
	});

	it('builds a value without reference', () => {
		const attributedText = createAttributedText({ text: createSanitizedHtml('<p>Texto</p>') });

		expect(attributedText.reference).toBeUndefined();
	});
});

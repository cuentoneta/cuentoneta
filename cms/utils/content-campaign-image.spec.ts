import { describe, expect, it } from 'vitest';

import { decodeAssetId } from './content-campaign-image';

describe('decodeAssetId', () => {
	it('reads the asset id, its dimensions and its format', () => {
		expect(decodeAssetId('image-852a122db56840452a0b7e2e58d73741de44bb01-1240x360-png')).toEqual({
			assetId: '852a122db56840452a0b7e2e58d73741de44bb01',
			dimensions: { width: 1240, height: 360 },
			format: 'png',
		});
	});

	it('supports the svg format, used by the default cover', () => {
		expect(decodeAssetId('image-852a122db56840452a0b7e2e58d73741de44bb01-229x320-svg').format).toBe('svg');
	});

	it('throws naming the id when it does not match the pattern', () => {
		// Antes se desestructuraba el resultado de exec() sin chequear el nulo: un id con otra forma
		// reventaba con un TypeError que no decía qué id lo causó.
		expect(() => decodeAssetId('file-852a122db56840452a0b7e2e58d73741de44bb01-pdf')).toThrow(
			'file-852a122db56840452a0b7e2e58d73741de44bb01-pdf',
		);
	});
});

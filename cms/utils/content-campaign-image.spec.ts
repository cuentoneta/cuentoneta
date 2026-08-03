import { describe, expect, it } from 'vitest';
import type { ImageValue, ValidationContext } from 'sanity';

import { campaignImageSizeValidation, decodeAssetId } from './content-campaign-image';

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

// El path del campo es `<viewport>.image`, así que el penúltimo segmento es el viewport.
const contextFor = (...path: string[]) => ({ path }) as unknown as ValidationContext;
const imageWithRef = (ref: string) => ({ _type: 'image', asset: { _type: 'reference', _ref: ref } }) as ImageValue;

describe('campaignImageSizeValidation', () => {
	it('accepts an image matching the exact size of its viewport', () => {
		const image = imageWithRef('image-852a122db56840452a0b7e2e58d73741de44bb01-1240x360-png');

		expect(campaignImageSizeValidation(image, contextFor('md', 'image'))).toBe(true);
	});

	it('reports the expected and the actual size when they differ', () => {
		const image = imageWithRef('image-852a122db56840452a0b7e2e58d73741de44bb01-800x200-png');

		const result = campaignImageSizeValidation(image, contextFor('md', 'image'));

		expect(result).toContain('1240 x 360');
		expect(result).toContain('800 x 200');
	});

	it('validates each viewport against its own size', () => {
		const image = imageWithRef('image-852a122db56840452a0b7e2e58d73741de44bb01-540x220-png');

		expect(campaignImageSizeValidation(image, contextFor('xs', 'image'))).toBe(true);
		expect(campaignImageSizeValidation(image, contextFor('md', 'image'))).not.toBe(true);
	});

	it('skips validation when the path segment is not a viewport', () => {
		const image = imageWithRef('image-852a122db56840452a0b7e2e58d73741de44bb01-800x200-png');

		expect(campaignImageSizeValidation(image, contextFor('otro', 'image'))).toBe(true);
	});

	it('skips validation when the image field exists without an asset', () => {
		// Es el estado del campo recién creado, antes de que el editor suba nada: antes reventaba con un
		// TypeError al intentar decodificar un id inexistente.
		expect(campaignImageSizeValidation({ _type: 'image' } as ImageValue, contextFor('md', 'image'))).toBe(true);
		expect(campaignImageSizeValidation(undefined, contextFor('md', 'image'))).toBe(true);
	});
});

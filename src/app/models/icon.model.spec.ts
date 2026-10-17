import type { IconMapper } from './icon.model';

// La tipificación de `ngIconsName` la evalúa el gate `typecheck`, que cubre los *.spec.ts. El caso
// válido y el inválido se sostienen entre sí: sin el primero, un `IconName` que no admitiera ningún
// nombre pasaría igual; sin el segundo, uno que admitiera cualquier string.
describe('IconMapper ngIconsName typing', () => {
	it('should accept a name declared by an installed icon set', () => {
		const mapper: IconMapper = { name: 'wattpad', ngIconsName: { simpleWattpad: '<svg />' } };

		expect(mapper.ngIconsName).toEqual({ simpleWattpad: '<svg />' });
	});

	it('should reject a name that no installed icon set declares', () => {
		const mapper: IconMapper = {
			name: 'wattpad',
			// @ts-expect-error el nombre real es `simpleWattpad`
			ngIconsName: { simpleWattpadx: '<svg />' },
		};

		expect(mapper.ngIconsName).toEqual({ simpleWattpadx: '<svg />' });
	});
});

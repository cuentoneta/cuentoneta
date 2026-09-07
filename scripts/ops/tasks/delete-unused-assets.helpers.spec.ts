import { isInsufficientPermissionsError } from './delete-unused-assets.helpers';

describe('isInsufficientPermissionsError', () => {
	it('reconoce el error de permisos insuficientes de Sanity por su mensaje', () => {
		expect(isInsufficientPermissionsError(new Error('Insufficient permissions; could not perform action'))).toBe(true);
	});

	it('descarta errores que no son de permisos', () => {
		expect(isInsufficientPermissionsError(new Error('Network request failed'))).toBe(false);
	});

	it('descarta valores que no son errores, aunque su texto coincida', () => {
		expect(isInsufficientPermissionsError('Insufficient permissions')).toBe(false);
	});
});

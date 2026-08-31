import { toNavigationContext } from './navigation-params';

describe('toNavigationContext', () => {
	it('should resolve the collection context', () => {
		expect(toNavigationContext('collection')).toBe('collection');
	});

	it('should resolve the author context', () => {
		expect(toNavigationContext('author')).toBe('author');
	});

	// El router asigna `undefined` explícitamente cuando el query param desaparece al navegar, así que
	// no alcanza con el default del input: el transform tiene que aceptarlo. El fallback cubre además
	// los contextos que llegan desde afuera: el 301 de las rutas retiradas preserva la query string, así
	// que un enlace compartido puede traer un valor que el transform ya no reconoce.
	it.each([undefined, '', 'cualquier-otra-cosa'])('should fall back to the author context for %p', (value) => {
		expect(toNavigationContext(value)).toBe('author');
	});
});

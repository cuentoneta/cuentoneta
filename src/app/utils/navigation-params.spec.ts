import { toNavigationContext } from './navigation-params';

describe('toNavigationContext', () => {
	it('should resolve the collection context', () => {
		expect(toNavigationContext('collection')).toBe('collection');
	});

	it('should resolve the author context', () => {
		expect(toNavigationContext('author')).toBe('author');
	});

	// El router asigna `undefined` explícitamente cuando el query param desaparece al navegar, así que
	// no alcanza con el default del input: el transform tiene que aceptarlo. `storylist` es el nombre
	// viejo del contexto de colección, que sigue llegando desde enlaces compartidos hacia afuera.
	it.each([undefined, '', 'storylist', 'cualquier-otra-cosa'])(
		'should fall back to the author context for %p',
		(value) => {
			expect(toNavigationContext(value)).toBe('author');
		},
	);
});

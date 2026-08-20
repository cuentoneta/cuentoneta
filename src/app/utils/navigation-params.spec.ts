import { toNavigationContext } from './navigation-params';

describe('toNavigationContext', () => {
	it('should resolve the collection context', () => {
		expect(toNavigationContext('collection')).toBe('collection');
	});

	// El nombre viejo del contexto quedó escrito en enlaces ya compartidos hacia afuera. Sin esta
	// entrada caerían en las sugerencias de autor sin que nada lo señale.
	// TODO(#2269): retirar este caso junto con el valor legado.
	it('should still resolve the legacy name of the collection context', () => {
		expect(toNavigationContext('storylist')).toBe('collection');
	});

	it('should resolve the author context', () => {
		expect(toNavigationContext('author')).toBe('author');
	});

	// El router asigna `undefined` explícitamente cuando el query param desaparece al navegar, así que
	// no alcanza con el default del input: el transform tiene que aceptarlo.
	it.each([undefined, '', 'cualquier-otra-cosa'])('should fall back to the author context for %p', (value) => {
		expect(toNavigationContext(value)).toBe('author');
	});
});

import type { DetachedWindowAPI } from 'happy-dom';

const happyDOM = (window as unknown as { happyDOM: DetachedWindowAPI }).happyDOM;

describe('entorno de test (happy-dom)', () => {
	// Con la navegación de frames hijos habilitada, cada <iframe> montado por un spec dispara un fetch
	// real y su aborto al desmontar tumba la corrida entera. Afirmar el flag —y no el comportamiento
	// observable— es deliberado: comprobarlo montando un iframe dependería de la red que se busca evitar.
	it('no navega los frames hijos', () => {
		expect(happyDOM.settings.navigation.disableChildFrameNavigation).toBe(true);
	});
});

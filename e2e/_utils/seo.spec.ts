import { getTransferState } from './seo';

const page = (head: string) => `<!doctype html><html lang="es"><head>${head}</head><body></body></html>`;

describe('getTransferState', () => {
	it('returns an empty object when the page carries no transfer state', () => {
		expect(getTransferState(page('<title>Obras</title>'))).toEqual({});
	});

	it('parses the transfer state block, with every response body under b', () => {
		const state = {
			'123': { b: { entries: [], total: 0 }, s: 200, u: '/api/literary-work' },
		};

		const html = page(`<script id="serverApp-state" type="application/json">${JSON.stringify(state)}</script>`);

		expect(getTransferState(html)).toEqual(state);
	});

	// Un bloque con otro id no es el de la transfer cache: tomarlo dejaría al test del estado transferido
	// verificando un JSON cualquiera.
	it('ignores a json script that is not the transfer state block', () => {
		const html = page('<script id="other-state" type="application/json">{"x":1}</script>');

		expect(getTransferState(html)).toEqual({});
	});
});

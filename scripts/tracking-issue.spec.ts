import { findTrackingIssue, selectTrackingIssue, type GhRunner } from './tracking-issue';

const TITLE = 'Menciones a issues que ya cerraron';

/**
 * Registra los argumentos con los que se invocó `gh` y devuelve una respuesta preparada. Es un espía y
 * no un stub porque la mitad de lo que hay que afirmar es **qué se consultó**: una búsqueda sin
 * `--state open`, o con otro filtro, adoptaría issues que el barrido no debe tocar.
 */
function spyRunner(response: unknown): GhRunner & { calls: string[][] } {
	const calls: string[][] = [];
	const run = (...args: string[]) => {
		calls.push(args);
		return JSON.stringify(response);
	};
	return Object.assign(run, { calls });
}

describe('selectTrackingIssue', () => {
	it('exige igualdad exacta de título', () => {
		const issues = [{ title: 'Detectar periódicamente las menciones a issues que ya cerraron' }, { title: TITLE }];

		expect(selectTrackingIssue(issues, TITLE)).toBe(issues[1]);
	});

	it('devuelve null cuando ninguno coincide', () => {
		expect(selectTrackingIssue([{ title: 'otro' }], TITLE)).toBeNull();
	});
});

describe('findTrackingIssue', () => {
	it('descarta los vecinos que el filtro in:title arrastra', () => {
		const run = spyRunner([
			{ number: 10, title: `${TITLE} (histórico)`, body: 'ajeno' },
			{ number: 11, title: TITLE, body: 'propio' },
		]);

		expect(findTrackingIssue(TITLE, run)).toEqual({ number: 11, body: 'propio' });
	});

	it('devuelve null cuando la búsqueda no trae el título exacto', () => {
		expect(findTrackingIssue(TITLE, spyRunner([{ number: 10, title: 'otro', body: '' }]))).toBeNull();
	});

	// El cuerpo ausente llega como `null` desde la API, y quien lo recibe busca ahí la huella de la
	// corrida anterior: sin normalizar, esa comparación explota en vez de decir "no hay huella".
	it('normaliza a cadena vacía el cuerpo ausente', () => {
		const run = spyRunner([{ number: 12, title: TITLE, body: null }]);

		expect(findTrackingIssue(TITLE, run)).toEqual({ number: 12, body: '' });
	});

	it('consulta solo issues abiertos y acotados por título', () => {
		const run = spyRunner([]);

		findTrackingIssue(TITLE, run);

		expect(run.calls).toEqual([
			['issue', 'list', '--state', 'open', '--search', `"${TITLE}" in:title`, '--json', 'number,title,body'],
		]);
	});
});

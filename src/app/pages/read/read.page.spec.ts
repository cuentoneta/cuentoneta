// Core
import { RESPONSE_INIT } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

// 3rd party modules
import { render, screen } from '@testing-library/angular';
import { of, throwError, type Observable } from 'rxjs';

// Models
import type { LiteraryWork } from '@models/literary-work.model';
import { elOdioLiteraryWorkMock } from '@mocks/onoff/el-odio.mock';
import { neronLiteraryWorkMock } from '@mocks/onoff/neron.mock';
import { provideLiteraryWorkApiMock } from '../../providers/literary-work.mock';
import type { LiteraryWorkApi } from '../../providers/literary-work-api.interface';
import ReadPage from './read.page';

class StubFailingLiteraryWorkApi implements LiteraryWorkApi {
	constructor(private readonly status: number) {}

	public getBySlug(): Observable<LiteraryWork> {
		return throwError(() => new HttpErrorResponse({ status: this.status, statusText: 'error' }));
	}
}

// El doble por defecto sirve El odio; los casos que dependen de otra obra del corpus la inyectan.
class StubLiteraryWorkApiReturning implements LiteraryWorkApi {
	constructor(private readonly literaryWork: LiteraryWork) {}

	public getBySlug(): Observable<LiteraryWork> {
		return of(this.literaryWork);
	}
}

describe('ReadPage', () => {
	const setup = async (api?: LiteraryWorkApi, responseInit?: ResponseInit) => {
		return await render(ReadPage, {
			providers: [
				provideLiteraryWorkApiMock(api),
				...(responseInit ? [{ provide: RESPONSE_INIT, useValue: responseInit }] : []),
			],
			inputs: { slug: elOdioLiteraryWorkMock.slug },
		});
	};

	it('renderiza el H1, el byline y el cuerpo saneado', async () => {
		await setup();

		expect(await screen.findByRole('heading', { level: 1, name: elOdioLiteraryWorkMock.title })).toBeTruthy();
		expect(screen.getByText(elOdioLiteraryWorkMock.authors[0].name)).toBeTruthy();
		expect(screen.getByText(/No empezó por nada/i)).toBeTruthy();
	});

	it('renderiza la barra de lectura con el tiempo total y el botón Compartir', async () => {
		await setup();

		expect(
			await screen.findByText(new RegExp(`${elOdioLiteraryWorkMock.totalReadingTime} minutos de lectura`)),
		).toBeTruthy();
		expect(screen.getByRole('button', { name: /compartir/i })).toBeTruthy();
	});

	it('renderiza el título de sección con su ancla', async () => {
		await setup();

		const heading = await screen.findByRole('heading', { level: 2, name: 'El primer golpe' });
		expect(heading.getAttribute('id')).toBe('el-primer-golpe');
	});

	it('renderiza la nota editorial de la obra bajo su propio encabezado', async () => {
		await setup();

		expect(await screen.findByRole('heading', { level: 2, name: 'Nota editorial' })).toBeTruthy();
		expect(screen.getByText(/una manera estable de habitar el mundo/i)).toBeTruthy();
	});

	it('omite el bloque de nota editorial en una obra que no la tiene', async () => {
		await setup(new StubLiteraryWorkApiReturning(neronLiteraryWorkMock));

		expect(await screen.findByRole('heading', { level: 1, name: neronLiteraryWorkMock.title })).toBeTruthy();
		expect(screen.queryByRole('heading', { level: 2, name: 'Nota editorial' })).toBeNull();
	});

	it('renderiza el estado not-found y marca la respuesta SSR como 404', async () => {
		const responseInit: ResponseInit = {};
		await setup(new StubFailingLiteraryWorkApi(404), responseInit);

		expect(await screen.findByText(/no encontramos esta obra/i)).toBeTruthy();
		expect(responseInit.status).toBe(404);
	});

	it('no marca la respuesta SSR para errores que no son 404', async () => {
		const responseInit: ResponseInit = {};
		await setup(new StubFailingLiteraryWorkApi(500), responseInit);

		expect(await screen.findByText(/no encontramos esta obra/i)).toBeTruthy();
		expect(responseInit.status).toBeUndefined();
	});
});

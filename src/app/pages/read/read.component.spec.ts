// Core
import { RESPONSE_INIT } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

// 3rd party modules
import { render, screen } from '@testing-library/angular';
import { throwError, type Observable } from 'rxjs';

// Models
import type { LiteraryWork } from '@models/literary-work.model';
import { elOdioLiteraryWorkMock } from '@mocks/onoff/el-odio.mock';
import { provideLiteraryWorkApiMock } from '../../providers/literary-work.mock';
import type { LiteraryWorkApi } from '../../providers/literary-work-api.interface';
import ReadComponent from './read.component';

class StubFailingLiteraryWorkApi implements LiteraryWorkApi {
	constructor(private readonly status: number) {}

	public getBySlug(): Observable<LiteraryWork> {
		return throwError(() => new HttpErrorResponse({ status: this.status, statusText: 'error' }));
	}
}

describe('ReadComponent', () => {
	const setup = async (api?: LiteraryWorkApi, responseInit?: ResponseInit) => {
		return await render(ReadComponent, {
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

	it('renderiza el título de sección con su ancla', async () => {
		await setup();

		const heading = await screen.findByRole('heading', { level: 2, name: 'El primer golpe' });
		expect(heading.getAttribute('id')).toBe('el-primer-golpe');
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

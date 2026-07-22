// Core
import { RESPONSE_INIT } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

// 3rd party modules
import { render, screen } from '@testing-library/angular';
import { throwError, type Observable } from 'rxjs';

// Models
import type { LiteraryWork } from '@models/literary-work.model';
import { literaryWorkMock } from '@mocks/literary-work.mock';
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
			inputs: { slug: literaryWorkMock.slug },
		});
	};

	it('renders the H1, the byline and the sanitized body', async () => {
		await setup();

		expect(await screen.findByRole('heading', { level: 1, name: literaryWorkMock.title })).toBeTruthy();
		expect(screen.getByText(literaryWorkMock.authors[0].name)).toBeTruthy();
		expect(screen.getByText(/una taza fría/i)).toBeTruthy();
	});

	it('renders the chapter title with its anchor id', async () => {
		await setup();

		const heading = await screen.findByRole('heading', { level: 2, name: 'La espera' });
		expect(heading.getAttribute('id')).toBe('la-espera');
	});

	it('renders the not-found state and flags the SSR response as 404', async () => {
		const responseInit: ResponseInit = {};
		await setup(new StubFailingLiteraryWorkApi(404), responseInit);

		expect(await screen.findByText(/no encontramos esta obra/i)).toBeTruthy();
		expect(responseInit.status).toBe(404);
	});

	it('does not flag the SSR response for non-404 errors', async () => {
		const responseInit: ResponseInit = {};
		await setup(new StubFailingLiteraryWorkApi(500), responseInit);

		expect(await screen.findByText(/no encontramos esta obra/i)).toBeTruthy();
		expect(responseInit.status).toBeUndefined();
	});
});

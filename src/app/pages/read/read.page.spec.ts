// Core
import { RESPONSE_INIT } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

// 3rd party modules
import { render, screen } from '@testing-library/angular';
import { throwError, type Observable } from 'rxjs';

// Models
import type { LiteraryWork } from '@models/literary-work.model';
import {
	onoffLiteraryWorksMock,
	onoffLiteraryWorksWithEditorialNote,
	onoffLiteraryWorksWithoutEditorialNote,
	onoffLiteraryWorksWithSectionTitles,
} from '@mocks/onoff-literary-works.mock';
import { provideLiteraryWorkApiMock, StubLiteraryWorkApi } from '../../providers/literary-work.mock';
import type { LiteraryWorkApi } from '../../providers/literary-work-api.interface';
import ReadPage from './read.page';

class StubFailingLiteraryWorkApi implements LiteraryWorkApi {
	constructor(private readonly status: number) {}

	public getBySlug(): Observable<LiteraryWork> {
		return throwError(() => new HttpErrorResponse({ status: this.status, statusText: 'error' }));
	}
}

// Obra representativa del canon para los casos que solo necesitan una obra cualquiera (su slug, o el
// camino de error): se toma de la colección, no por import directo de un mock específico.
const [representativeLiteraryWork] = onoffLiteraryWorksMock;

// NOTA (#1471): `ReadPage` es hoy un walking skeleton (#1853); estos tests cubren su render y sus
// estados mínimos. Al implementar la ReadPage V3 completa en #1471 se expanden y robustecen
// (variantes de media, sección "Más cuentos", layout V3), reemplazando estos casos transitorios.
describe('ReadPage', () => {
	const setup = async (
		literaryWork: LiteraryWork,
		options: { api?: LiteraryWorkApi; responseInit?: ResponseInit } = {},
	) => {
		return await render(ReadPage, {
			providers: [
				provideLiteraryWorkApiMock(options.api ?? new StubLiteraryWorkApi(literaryWork)),
				...(options.responseInit ? [{ provide: RESPONSE_INIT, useValue: options.responseInit }] : []),
			],
			inputs: { slug: literaryWork.slug },
		});
	};

	it.each(onoffLiteraryWorksMock)(
		'renderiza el H1, el byline y la barra de lectura de "$slug"',
		async (literaryWork) => {
			await setup(literaryWork);

			expect(await screen.findByRole('heading', { level: 1, name: literaryWork.title })).toBeTruthy();
			expect(screen.getByText(literaryWork.authors[0].name)).toBeTruthy();
			expect(screen.getByText(new RegExp(`${literaryWork.totalReadingTime} minutos de lectura`))).toBeTruthy();
			expect(screen.getByRole('button', { name: /compartir/i })).toBeTruthy();
		},
	);

	it('renderiza el cuerpo saneado de la obra', async () => {
		await setup(representativeLiteraryWork);

		// Una palabra del cuerpo saneado (sin tags) de la propia obra, para verificar que el bodyHtml
		// se renderiza — derivada de la obra, no un texto clavado de una obra concreta.
		const bodyText = representativeLiteraryWork.content[0].bodyHtml.replace(/<[^>]+>/g, ' ');
		const [bodyWord] = bodyText.match(/\p{L}{6,}/gu) ?? [];
		if (bodyWord === undefined) {
			throw new Error(`La primera sección de "${representativeLiteraryWork.slug}" no tiene texto de cuerpo`);
		}

		expect((await screen.findAllByText(new RegExp(bodyWord, 'i'))).length).toBeGreaterThan(0);
	});

	it.each(onoffLiteraryWorksWithSectionTitles)(
		'renderiza el título de sección de "$slug" con su ancla',
		async (literaryWork) => {
			await setup(literaryWork);

			const titledSection = literaryWork.content.find((section) => section.title !== undefined);
			const sectionTitle = titledSection?.title;
			if (sectionTitle === undefined) {
				throw new Error(
					`"${literaryWork.slug}" está en onoffLiteraryWorksWithSectionTitles pero no tiene sección con título`,
				);
			}

			const heading = await screen.findByRole('heading', { level: 2, name: sectionTitle.value });
			expect(heading.getAttribute('id')).toBe(sectionTitle.toAnchor());
		},
	);

	it.each(onoffLiteraryWorksWithEditorialNote)(
		'renderiza la nota editorial de "$slug" bajo su propio encabezado',
		async (literaryWork) => {
			await setup(literaryWork);

			expect(await screen.findByRole('heading', { level: 2, name: 'Nota editorial' })).toBeTruthy();

			const noteText = (literaryWork.editorialNote ?? '').replace(/<[^>]+>/g, ' ');
			const [noteWord] = noteText.match(/\p{L}{6,}/gu) ?? [];
			if (noteWord === undefined) {
				throw new Error(`La nota editorial de "${literaryWork.slug}" no tiene texto`);
			}

			expect(screen.getAllByText(new RegExp(noteWord, 'i')).length).toBeGreaterThan(0);
		},
	);

	it.each(onoffLiteraryWorksWithoutEditorialNote)(
		'omite el bloque de nota editorial en "$slug", que no la tiene',
		async (literaryWork) => {
			await setup(literaryWork);

			expect(await screen.findByRole('heading', { level: 1, name: literaryWork.title })).toBeTruthy();
			expect(screen.queryByRole('heading', { level: 2, name: 'Nota editorial' })).toBeNull();
		},
	);

	it('should render the not-found state and mark the SSR response as 404', async () => {
		const responseInit: ResponseInit = {};
		await setup(representativeLiteraryWork, { api: new StubFailingLiteraryWorkApi(404), responseInit });

		expect(await screen.findByText(/no encontramos esta obra/i)).toBeTruthy();
		expect(responseInit.status).toBe(404);
	});

	// Un 200 acá lo cachearía el borde como si fuera contenido, sin purga que lo desaloje.
	it('should mark the SSR response as 503 when the failure is not a 404', async () => {
		const responseInit: ResponseInit = {};
		await setup(representativeLiteraryWork, { api: new StubFailingLiteraryWorkApi(500), responseInit });

		expect(await screen.findByText(/no encontramos esta obra/i)).toBeTruthy();
		expect(responseInit.status).toBe(503);
	});
});

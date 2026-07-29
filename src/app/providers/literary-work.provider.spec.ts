import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { LiteraryWork } from '@models/literary-work.model';
import { authorMock } from '@mocks/author.mock';
import { environment } from '../environments/environment';
import { Endpoints } from './endpoints';
import { HttpLiteraryWorkApi } from './literary-work.provider';
import type { LiteraryWorkDto } from './literary-work-api.interface';

const baseDto: LiteraryWorkDto = {
	_id: 'literaryWork_1',
	slug: 'la-vigilia-de-onoff',
	title: 'La vigilia de Onoff',
	coverImage: '',
	totalReadingTime: 5,
	sectionCount: 1,
	tags: [],
	authors: [],
	content: [
		{
			position: 0,
			title: { value: 'La espera' },
			epigraphs: [{ text: '<p><em>Epígrafe</em></p>', reference: '<p>Anónimo</p>' }],
			bodyHtml: '<p>Cuerpo saneado.</p>',
			readingTime: 2,
		},
	],
	mediaSources: [],
	resources: [],
	badLanguage: false,
	originalPublication: '',
	publishedAt: '2026-07-01T12:00:00Z',
};

const validDto: LiteraryWorkDto = { ...baseDto, authors: [authorMock] };

describe('HttpLiteraryWorkApi', () => {
	let api: HttpLiteraryWorkApi;
	let http: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		api = TestBed.inject(HttpLiteraryWorkApi);
		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		http.verify();
	});

	function requestBySlug(dto: LiteraryWorkDto): Promise<LiteraryWork> {
		const result = new Promise<LiteraryWork>((resolve, reject) => {
			api.getBySlug(dto.slug).subscribe({ next: resolve, error: reject });
		});
		http.expectOne(`${environment.apiUrl}${Endpoints.LiteraryWork}/${dto.slug}`).flush(dto);
		return result;
	}

	it('rehydrates the wire DTO into a frozen domain aggregate', async () => {
		const literaryWork = await requestBySlug(validDto);

		expect(Object.isFrozen(literaryWork)).toBe(true);
		expect(literaryWork.slug).toBe('la-vigilia-de-onoff');
		expect(literaryWork.content[0].title?.toAnchor()).toBe('la-espera');
		expect(literaryWork.content[0].epigraphs?.[0].reference).toContain('Anónimo');
	});

	it('derives totalReadingTime from the sections, ignoring the wire value', async () => {
		// El wire trae 40, pero createLiteraryWork lo re-deriva como la suma de las secciones
		// (una sola sección con readingTime 2) — el total autoritativo no cruza como option.
		const literaryWork = await requestBySlug({ ...validDto, totalReadingTime: 40 });

		expect(literaryWork.totalReadingTime).toBe(2);
	});

	it('errors the stream when the DTO violates a domain invariant', async () => {
		await expect(requestBySlug({ ...baseDto, authors: [] })).rejects.toThrow(
			'LiteraryWork inválida: sin autores (slug "la-vigilia-de-onoff") — la obra anónima referencia al author "Anónimo"',
		);
	});
});

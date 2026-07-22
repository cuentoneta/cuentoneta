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
			chapterTitle: { value: 'La espera' },
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
		const work = await requestBySlug(validDto);

		expect(Object.isFrozen(work)).toBe(true);
		expect(work.slug).toBe('la-vigilia-de-onoff');
		expect(work.content[0].chapterTitle?.toAnchor()).toBe('la-espera');
		expect(work.content[0].epigraphs?.[0].reference).toContain('Anónimo');
	});

	it('preserves the backend-resolved totalReadingTime instead of re-deriving it', async () => {
		const work = await requestBySlug({ ...validDto, totalReadingTime: 40 });

		expect(work.totalReadingTime).toBe(40);
	});

	it('errors the stream when the DTO violates a domain invariant', async () => {
		await expect(requestBySlug({ ...baseDto, authors: [] })).rejects.toThrow(
			'LiteraryWork inválida: sin autores (slug "la-vigilia-de-onoff") — la obra anónima referencia al author "Anónimo"',
		);
	});
});

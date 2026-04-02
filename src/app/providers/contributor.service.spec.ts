import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ContributorService } from './contributor.service';
import { Contributor } from '@models/contributor.model';
import { environment } from '../environments/environment';
import { Endpoints } from './endpoints';
import { provideHttpClient } from '@angular/common/http';

describe('ContributorService', () => {
	let service: ContributorService;
	let httpMock: HttpTestingController;
	const apiUrl = `${environment.apiUrl}${Endpoints.Contributor}`;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ContributorService, provideHttpClient(), provideHttpClientTesting()],
		});
		service = TestBed.inject(ContributorService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('getAll', () => {
		it('should fetch all contributors from the API', () => {
			const mockContributors: Contributor[] = [
				{
					slug: 'ramiro-olivencia',
					name: 'Ramiro Olivencia',
					area: { slug: 'staff', name: 'Staff' },
					link: { handle: '@rolivenc', url: 'https://twitter.com/rolivenc' },
					notes: 'Líder de Proyecto',
				},
				{
					slug: 'erik-giovani',
					name: 'Erik Giovani',
					area: { slug: 'programming', name: 'Programación' },
					link: { handle: '@ErikGiovani', url: 'https://github.com/erikgiovani' },
				},
				{
					slug: 'sofia-abramovich',
					name: 'Sofía Abramovich',
					area: { slug: 'content-generation', name: 'Generación de contenido' },
					link: { handle: '@__sofiaabigail', url: 'https://twitter.com/__sofiaabigail' },
					notes: 'Autora de Instrucciones para leer en Otoño',
				},
				{
					slug: 'patricio-decoud',
					name: 'Patricio Decoud',
					area: { slug: 'content-pick', name: 'Selección, transcripción y curación de contenido' },
					link: { handle: '@arrobapato', url: 'https://twitter.com/arroba_pato' },
				},
			];

			service.getAll().subscribe((contributors) => {
				expect(contributors).toEqual(mockContributors);
				expect(contributors.length).toBe(4);
			});

			const req = httpMock.expectOne(apiUrl);
			expect(req.request.method).toBe('GET');
			req.flush(mockContributors);
		});

		it('should return an empty array when no contributors are available', () => {
			service.getAll().subscribe((contributors) => {
				expect(contributors).toEqual([]);
				expect(contributors.length).toBe(0);
			});

			const req = httpMock.expectOne(apiUrl);
			expect(req.request.method).toBe('GET');
			req.flush([]);
		});

		it('should handle HTTP errors gracefully', () => {
			service.getAll().subscribe(
				() => {
					fail('should have failed');
				},
				(error) => {
					expect(error.status).toBe(500);
				},
			);

			const req = httpMock.expectOne(apiUrl);
			req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
		});
	});
});

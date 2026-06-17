import { TestBed } from '@angular/core/testing';

// Services
import { HttpAuthorApi } from './author.provider';

// Providers
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('HttpAuthorApi', () => {
	let service: HttpAuthorApi;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		service = TestBed.inject(HttpAuthorApi);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

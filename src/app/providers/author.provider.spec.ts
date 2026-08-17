import { TestBed } from '@angular/core/testing';

// Services
import { AuthorApi, HttpAuthorApi } from './author.provider';

// Providers
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAuthorApiMock, StubAuthorApi } from './author.mock';

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

describe('AuthorApi', () => {
	it('resolves the http implementation with no explicit provider', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		expect(TestBed.inject(AuthorApi)).toBeInstanceOf(HttpAuthorApi);
	});

	it('lets the test double override the default implementation', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting(), provideAuthorApiMock()],
		});

		expect(TestBed.inject(AuthorApi)).toBeInstanceOf(StubAuthorApi);
	});
});

import { TestBed } from '@angular/core/testing';

// Servicios
import { ContentApi, HttpContentApi } from './content.provider';

// Proveedores
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideContentApiMock, StubContentApi } from './content.mock';

describe('HttpContentApi', () => {
	let service: HttpContentApi;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		service = TestBed.inject(HttpContentApi);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

describe('ContentApi', () => {
	it('resolves the http implementation with no explicit provider', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		expect(TestBed.inject(ContentApi)).toBeInstanceOf(HttpContentApi);
	});

	it('lets the test double override the default implementation', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting(), provideContentApiMock()],
		});

		expect(TestBed.inject(ContentApi)).toBeInstanceOf(StubContentApi);
	});
});

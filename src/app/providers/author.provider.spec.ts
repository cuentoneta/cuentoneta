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
	// La factory del token es lo único que ata el contrato a su implementación HTTP: sin ella
	// la app arranca sin proveedor y falla recién al inyectarlo, ya en la ruta que lo necesita.
	it('resuelve la implementación HTTP sin ningún proveedor explícito', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		expect(TestBed.inject(AuthorApi)).toBeInstanceOf(HttpAuthorApi);
	});

	it('deja que el doble sustituya la implementación por defecto', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting(), provideAuthorApiMock()],
		});

		expect(TestBed.inject(AuthorApi)).toBeInstanceOf(StubAuthorApi);
	});
});

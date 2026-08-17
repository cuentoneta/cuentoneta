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
		TestBed.runInInjectionContext(() => {
			service = TestBed.inject(HttpContentApi);
		});
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

describe('ContentApi', () => {
	// La factory del token es lo único que ata el contrato a su implementación HTTP: sin ella
	// la app arranca sin proveedor y falla recién al inyectarlo, ya en la ruta que lo necesita.
	it('resuelve la implementación HTTP sin ningún proveedor explícito', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		expect(TestBed.inject(ContentApi)).toBeInstanceOf(HttpContentApi);
	});

	it('deja que el doble sustituya la implementación por defecto', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting(), provideContentApiMock()],
		});

		expect(TestBed.inject(ContentApi)).toBeInstanceOf(StubContentApi);
	});
});

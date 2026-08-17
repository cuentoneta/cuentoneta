import { TestBed } from '@angular/core/testing';

// Servicios
import { HttpStoryApi, StoryApi } from './story.provider';

// Proveedores
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideStoryApiMock, StubStoryApi } from './story.mock';

describe('HttpStoryApi', () => {
	let service: HttpStoryApi;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		TestBed.runInInjectionContext(() => {
			service = TestBed.inject(HttpStoryApi);
		});
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

describe('StoryApi', () => {
	// La factory del token es lo único que ata el contrato a su implementación HTTP: sin ella
	// la app arranca sin proveedor y falla recién al inyectarlo, ya en la ruta que lo necesita.
	it('resuelve la implementación HTTP sin ningún proveedor explícito', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		expect(TestBed.inject(StoryApi)).toBeInstanceOf(HttpStoryApi);
	});

	it('deja que el doble sustituya la implementación por defecto', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting(), provideStoryApiMock()],
		});

		expect(TestBed.inject(StoryApi)).toBeInstanceOf(StubStoryApi);
	});
});

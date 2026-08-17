import { TestBed } from '@angular/core/testing';

// Servicios
import { HttpStorylistApi, StorylistApi } from './storylist.provider';

// Proveedores
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideStorylistApiMock, StubStorylistApi } from './storylist.mock';

describe('HttpStorylistApi', () => {
	let service: HttpStorylistApi;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		TestBed.runInInjectionContext(() => {
			service = TestBed.inject(HttpStorylistApi);
		});
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

describe('StorylistApi', () => {
	// La factory del token es lo único que ata el contrato a su implementación HTTP: sin ella
	// la app arranca sin proveedor y falla recién al inyectarlo, ya en la ruta que lo necesita.
	it('resuelve la implementación HTTP sin ningún proveedor explícito', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		expect(TestBed.inject(StorylistApi)).toBeInstanceOf(HttpStorylistApi);
	});

	it('deja que el doble sustituya la implementación por defecto', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting(), provideStorylistApiMock()],
		});

		expect(TestBed.inject(StorylistApi)).toBeInstanceOf(StubStorylistApi);
	});
});

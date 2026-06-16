import { TestBed } from '@angular/core/testing';

// Servicios
import { HttpStorylistApi } from './storylist.provider';

// Proveedores
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

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

import { TestBed } from '@angular/core/testing';

// Servicios
import { HttpContentApi } from './content.provider';

// Proveedores
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

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

import { TestBed } from '@angular/core/testing';

// Servicios
import { StorylistService } from './storylist.service';

// Proveedores
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('StorylistService', () => {
	let service: StorylistService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		TestBed.runInInjectionContext(() => {
			service = TestBed.inject(StorylistService);
		});
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

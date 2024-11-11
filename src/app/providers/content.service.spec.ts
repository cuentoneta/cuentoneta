import { TestBed } from '@angular/core/testing';

// Servicios
import { ContentService } from './content.service';

// Proveedores
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ContentService', () => {
	let service: ContentService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		TestBed.runInInjectionContext(() => {
			service = TestBed.inject(ContentService);
		});
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

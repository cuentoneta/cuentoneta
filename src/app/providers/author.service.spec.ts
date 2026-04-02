import { TestBed } from '@angular/core/testing';

// Services
import { AuthorService } from './author.service';

// Providers
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AuthorService', () => {
	let service: AuthorService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		service = TestBed.inject(AuthorService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

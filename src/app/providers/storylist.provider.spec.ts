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
		service = TestBed.inject(HttpStorylistApi);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

describe('StorylistApi', () => {
	it('resolves the http implementation with no explicit provider', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		expect(TestBed.inject(StorylistApi)).toBeInstanceOf(HttpStorylistApi);
	});

	it('lets the test double override the default implementation', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting(), provideStorylistApiMock()],
		});

		expect(TestBed.inject(StorylistApi)).toBeInstanceOf(StubStorylistApi);
	});
});

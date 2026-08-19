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
		service = TestBed.inject(HttpStoryApi);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

describe('StoryApi', () => {
	it('resolves the http implementation with no explicit provider', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		expect(TestBed.inject(StoryApi)).toBeInstanceOf(HttpStoryApi);
	});

	it('lets the test double override the default implementation', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting(), provideStoryApiMock()],
		});

		expect(TestBed.inject(StoryApi)).toBeInstanceOf(StubStoryApi);
	});
});

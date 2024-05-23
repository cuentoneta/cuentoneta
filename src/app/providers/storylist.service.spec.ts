import { TestBed } from '@angular/core/testing';

import { StorylistService } from './storylist.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('StorylistService', () => {
	let service: StorylistService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
		});
		TestBed.runInInjectionContext(() => {
			service = TestBed.inject(StorylistService);
		});
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

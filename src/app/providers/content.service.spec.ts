import { TestBed } from '@angular/core/testing';

import { ContentService } from './content.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

xdescribe('ContentService', () => {
	let service: ContentService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
		});
		TestBed.runInInjectionContext(() => {
			service = TestBed.inject(ContentService);
		});
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

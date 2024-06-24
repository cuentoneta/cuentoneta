import { TestBed } from '@angular/core/testing';

import { NavigationFrameService } from './navigation-frame.service';

describe('NavigationFrameService', () => {
	let service: NavigationFrameService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(NavigationFrameService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});

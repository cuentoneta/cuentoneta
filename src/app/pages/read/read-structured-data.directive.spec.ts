import { clearAllMocks } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { ReadStructuredDataDirective } from './read-structured-data.directive';

describe('ReadStructuredDataDirective', () => {
	function instantiate(): void {
		TestBed.runInInjectionContext(() => new ReadStructuredDataDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		TestBed.configureTestingModule({ providers: [ReadStructuredDataDirective] });
	});

	it('should not emit any JSON-LD yet — structured data for /read arrives with a later slice', () => {
		instantiate();
		TestBed.tick();

		expect(TestBed.inject(DOCUMENT).head.querySelectorAll('script[data-schema-id]')).toHaveLength(0);
	});
});

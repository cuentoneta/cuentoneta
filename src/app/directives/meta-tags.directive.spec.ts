import { MetaTagsDirective } from './meta-tags.directive';
import { TestBed } from '@angular/core/testing';

describe('MetaTagsDirective', () => {
	it('should create an instance', () => {
		TestBed.runInInjectionContext(() => {
			const directive = new MetaTagsDirective();
			expect(directive).toBeTruthy();
		});
	});
});

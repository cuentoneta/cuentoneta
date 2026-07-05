import { spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';

import DmcaComponent from './dmca.component';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';

describe('DmcaComponent', () => {
	it('should set the canonical URL for /dmca via buildCanonicalUrl', () => {
		const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');
		TestBed.createComponent(DmcaComponent);

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl('dmca'));
	});
});

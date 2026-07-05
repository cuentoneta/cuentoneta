import { spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import AuthorsComponent from './authors.component';
import { provideAuthorApiMock } from '../../providers/author.mock';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';

describe('AuthorsComponent', () => {
	it('should set the canonical URL for /authors via buildCanonicalUrl', () => {
		const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting(), provideAuthorApiMock()],
		});
		TestBed.createComponent(AuthorsComponent);

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl('authors'));
	});
});

import { render } from '@testing-library/angular';
import { restoreAllMocks, spyOn } from '@test-utils';
import { provideRouter } from '@angular/router';

import AuthorsComponent from './authors.component';
import { provideAuthorApiMock } from '../../providers/author.mock';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';

describe('AuthorsComponent', () => {
	afterEach(() => restoreAllMocks());

	it('should set the canonical URL for /authors via buildCanonicalUrl', async () => {
		const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');

		await render(AuthorsComponent, {
			providers: [provideRouter([]), provideAuthorApiMock()],
		});

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl('authors'));
	});
});

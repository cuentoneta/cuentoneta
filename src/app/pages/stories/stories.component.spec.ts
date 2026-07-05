import { render } from '@testing-library/angular';
import { restoreAllMocks, spyOn } from '@test-utils';
import { provideRouter } from '@angular/router';

import StoriesComponent from './stories.component';
import { AppRoutes } from '../../app.routes';
import { provideStoryApiMock } from '../../providers/story.mock';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';

describe('StoriesComponent', () => {
	afterEach(() => restoreAllMocks());

	it('should set the canonical URL for /story via buildCanonicalUrl', async () => {
		const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');

		await render(StoriesComponent, { providers: [provideRouter([]), provideStoryApiMock()] });

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(AppRoutes.Story));
	});
});

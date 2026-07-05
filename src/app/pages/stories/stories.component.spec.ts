import { spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import StoriesComponent from './stories.component';
import { AppRoutes } from '../../app.routes';
import { provideStoryApiMock } from '../../providers/story.mock';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';

describe('StoriesComponent', () => {
	it('should set the canonical URL for /story via buildCanonicalUrl', () => {
		const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting(), provideStoryApiMock()],
		});
		TestBed.createComponent(StoriesComponent);

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(AppRoutes.Story));
	});
});

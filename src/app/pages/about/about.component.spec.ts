import { render } from '@testing-library/angular';
import { restoreAllMocks, spyOn } from '@test-utils';

import AboutComponent from './about.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideContributorApiMock } from '../../providers/contributor.mock';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';

describe('AboutComponent', () => {
	const setup = async () => {
		return await render(AboutComponent, {
			providers: [provideHttpClient(), provideHttpClientTesting(), provideContributorApiMock()],
		});
	};

	afterEach(() => restoreAllMocks());

	it('should create', async () => {
		const view = setup();
		expect(view).toBeTruthy();
	});

	it('should set the canonical URL for /about via buildCanonicalUrl', async () => {
		const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');

		await setup();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl('about'));
	});
});

import { render } from '@testing-library/angular';
import { restoreAllMocks, spyOn } from '@test-utils';
import { provideRouter } from '@angular/router';

import DmcaPage from './dmca.page';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';

describe('DmcaPage', () => {
	afterEach(() => restoreAllMocks());

	it('should set the canonical URL for /dmca via buildCanonicalUrl', async () => {
		const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');

		await render(DmcaPage, { providers: [provideRouter([])] });

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl('dmca'));
	});
});

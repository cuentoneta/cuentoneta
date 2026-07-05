import { render } from '@testing-library/angular';
import { restoreAllMocks, spyOn } from '@test-utils';
import { provideRouter } from '@angular/router';

import DmcaComponent from './dmca.component';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@utils/build-canonical-url.util';

describe('DmcaComponent', () => {
	afterEach(() => restoreAllMocks());

	it('should set the canonical URL for /dmca via buildCanonicalUrl', async () => {
		const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');

		await render(DmcaComponent, { providers: [provideRouter([])] });

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl('dmca'));
	});
});

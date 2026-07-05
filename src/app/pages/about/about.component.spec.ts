import { render } from '@testing-library/angular';
import { spyOn } from '@test-utils';
import { TestBed } from '@angular/core/testing';

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

	it('should create', async () => {
		const view = setup();
		expect(view).toBeTruthy();
	});

	it('should set the canonical URL for /about via buildCanonicalUrl', () => {
		const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting(), provideContributorApiMock()],
		});
		TestBed.createComponent(AboutComponent);

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl('about'));
	});
});

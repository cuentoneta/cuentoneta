import { render } from '@testing-library/angular';

import AboutComponent from './about.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideContributorApiMock } from '../../providers/contributor.mock';

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
});

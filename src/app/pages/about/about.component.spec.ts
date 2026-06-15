import { render } from '@testing-library/angular';

import AboutComponent from './about.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideContributorMock } from '../../providers/contributor.mock';

describe('AboutComponent', () => {
	const setup = async () => {
		return await render(AboutComponent, {
			providers: [provideHttpClient(), provideHttpClientTesting(), provideContributorMock()],
		});
	};

	it('should create', async () => {
		const view = setup();
		expect(view).toBeTruthy();
	});
});

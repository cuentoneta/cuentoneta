import { render } from '@testing-library/angular';

import AboutComponent from './about.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AboutComponent', () => {
	const setup = async () => {
		return await render(AboutComponent, { providers: [provideHttpClient(), provideHttpClientTesting()] });
	};

	it('should create', async () => {
		const view = setup();
		expect(view).toBeTruthy();
	});
});

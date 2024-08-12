import { render } from '@testing-library/angular';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
	it('should create', async () => {
		const view = await render(FooterComponent);
		expect(view).toBeTruthy();
	});
});

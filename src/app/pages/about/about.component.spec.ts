import { render } from '@testing-library/angular';

import AboutComponent from './about.component';

describe('AboutComponent', () => {
	it('should create', async () => {
		const view = await render(AboutComponent);

		expect(view).toBeTruthy();
	});
});

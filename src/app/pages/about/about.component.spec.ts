import { render } from '@testing-library/angular';

import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
	it('should create', async () => {
		const component = await render(AboutComponent);

		expect(component).toBeTruthy();
	});
});

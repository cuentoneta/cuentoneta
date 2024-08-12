import { render } from '@testing-library/angular';

import { PublicationCardComponent } from './publication-card.component';

xdescribe('PublicationCardComponent', () => {
	it('should create', async () => {
		const view = await render(PublicationCardComponent);
		expect(view).toBeTruthy();
	});
});

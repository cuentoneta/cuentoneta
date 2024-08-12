import { render } from '@testing-library/angular';

import { PublicationCardComponent } from './publication-card.component';

xdescribe('PublicationCardComponent', () => {
	it('should create', async () => {
		const component = await render(PublicationCardComponent);

		expect(component).toBeTruthy();
	});
});

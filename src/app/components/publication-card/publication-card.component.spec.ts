import { render } from '@testing-library/angular';

import { PublicationCardComponent } from './publication-card.component';

describe('PublicationCardComponent', () => {
	it('should create', async () => {
		const component = await render(PublicationCardComponent);

		expect(component).toBeTruthy();
	});
});

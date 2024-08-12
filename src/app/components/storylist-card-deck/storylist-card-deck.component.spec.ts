import { render } from '@testing-library/angular';

import { StorylistCardDeckComponent } from './storylist-card-deck.component';

describe('StorylistCardDeckComponent', () => {
	it('should create', async () => {
		const view = await render(StorylistCardDeckComponent);
		expect(view).toBeTruthy();
	});
});

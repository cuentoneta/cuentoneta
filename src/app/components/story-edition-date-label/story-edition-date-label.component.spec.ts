import { render } from '@testing-library/angular';

import { StoryEditionDateLabelComponent } from './story-edition-date-label.component';

describe('StoryEditionDateLabelComponent', () => {
	it('should create', async () => {
		const view = await render(StoryEditionDateLabelComponent);
		expect(view).toBeTruthy();
	});
});

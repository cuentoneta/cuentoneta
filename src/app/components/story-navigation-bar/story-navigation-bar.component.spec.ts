import { StoryNavigationBarComponent } from './story-navigation-bar.component';

import { render } from '@testing-library/angular';

describe('StoryNavigationBarComponent', () => {
	it('should create', async () => {
		const view = await render(StoryNavigationBarComponent);
		expect(view).toBeTruthy();
	});
});

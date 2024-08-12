import { render } from '@testing-library/angular';

import { StoryCardSkeletonComponent } from './story-card-skeleton.component';

describe('StoryCardSkeletonComponent', () => {
	it('should create', async () => {
		const view = await render(StoryCardSkeletonComponent);
		expect(view).toBeTruthy();
	});
});

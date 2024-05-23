import { render } from '@testing-library/angular';

import { StoryCardSkeletonComponent } from './story-card-skeleton.component';

describe('StoryCardSkeletonComponent', () => {
	it('should create', async () => {
		const component = await render(StoryCardSkeletonComponent);

		expect(component).toBeTruthy();
	});
});

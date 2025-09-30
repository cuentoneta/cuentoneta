import { render } from '@testing-library/angular';

import { AuthorSkeletonComponent } from './author-skeleton.component';

describe('AuthorSkeletonComponent', () => {
	test('should render', async () => {
		const view = await render(AuthorSkeletonComponent);
		expect(view).toBeTruthy();
	});
});

import { render } from '@testing-library/angular';

import { ShareContentComponent } from './share-content.component';

describe('ShareContentComponent', () => {
	it('should create', async () => {
		const view = await render(ShareContentComponent);
		expect(view).toBeTruthy();
	});
});

import { render, screen } from '@testing-library/angular';
import { BadgeComponent } from './badge.component';
import { tagMock } from '../../mocks/tag.mocks';

describe('BadgeComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(BadgeComponent, {
			inputs: {
				tag: tagMock,
				showIcon: true,
			},
		});
		expect(container).toBeTruthy();
	});

	it('should display the mock badge title', async () => {
		await render(BadgeComponent, {
			inputs: {
				tag: tagMock,
				showIcon: true,
			},
		});
		const resourceElement = screen.getByText(tagMock.title);
		expect(resourceElement).toBeInTheDocument();
	});
});


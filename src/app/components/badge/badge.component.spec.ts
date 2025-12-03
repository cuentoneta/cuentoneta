import { render, screen } from '@testing-library/angular';
import { BadgeComponent } from './badge.component';
import { tagMock } from '../../mocks/tag.mocks';
import { TestBed } from '@angular/core/testing';
import { MockA11yTooltipModule } from '@mocks/external-libs/a11y-tooltip-module.mock';

const setupTestBed = (testbed: TestBed) => {
	(testbed as typeof TestBed).configureTestingModule({}).overrideComponent(BadgeComponent, {
		set: {
			imports: [MockA11yTooltipModule],
		},
	});
};
describe('BadgeComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(BadgeComponent, {
			inputs: {
				tag: tagMock,
				showIcon: true,
			},
			configureTestBed: setupTestBed,
		});
		expect(container).toBeTruthy();
	});

	it('should display the mock badge title', async () => {
		await render(BadgeComponent, {
			inputs: {
				tag: tagMock,
				showIcon: true,
			},
			configureTestBed: setupTestBed,
		});
		const resourceElement = screen.getByText(tagMock.title);
		expect(resourceElement).toBeInTheDocument();
	});
});

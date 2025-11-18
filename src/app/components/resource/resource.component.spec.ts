import { render, screen } from '@testing-library/angular';
import { ResourceComponent } from './resource.component';
import { resourceMock } from '@mocks/resource.mock';
import { TestBed } from '@angular/core/testing';
import { MockA11yTooltipModule } from '../../mocks/test/a11y-tooltip-module.mock';

const setupTestBed = (testbed: any) => {
	(testbed as typeof TestBed).configureTestingModule({}).overrideComponent(ResourceComponent, {
		set: {
			imports: [MockA11yTooltipModule],
		},
	});
};
describe('ResourceComponent', () => {
	const regexTitle = new RegExp(resourceMock.title, 'i');
	const url = resourceMock.url;

	const setup = async () => {
		return await render(ResourceComponent, {
			inputs: {
				resource: resourceMock,
			},
			configureTestBed: setupTestBed,
		});
	};

	it('should render the component', async () => {
		const { container } = await setup();

		expect(container).toBeInTheDocument();
	});

	it('should render title', async () => {
		await setup();
		const titleResourceElement = screen.getByTitle(regexTitle);

		expect(titleResourceElement).toBeInTheDocument();
	});

	it('should confirm the URL of the link', async () => {
		await setup();
		const linkResourceElement = screen.getByRole('link');

		expect(linkResourceElement).toHaveAttribute('href', url);
	});
});

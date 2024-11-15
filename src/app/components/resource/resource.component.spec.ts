import { render, screen } from '@testing-library/angular';
import { ResourceComponent } from './resource.component';
import { resourceMock } from 'src/app/mocks/resource.mock';

describe('ResourceComponent', () => {
	const regexTitle = new RegExp(resourceMock.title, 'i');
	const url = resourceMock.url;

	const setup = async () => {
		return await render(ResourceComponent, {
			inputs: {
				resource: resourceMock,
			},
		});
	};

	it('should render the component', async () => {
		const { container } = await setup();

		expect(container).toBeInTheDocument();
	});

	it('should render title', async () => {
		await setup();
		const titleResourceElement = screen.getByAltText(regexTitle);

		expect(titleResourceElement).toBeInTheDocument();
	});

	it('should confirm the URL of the link', async () => {
		await setup();
		const linkResourceElement = screen.getByRole('link');

		expect(linkResourceElement).toHaveAttribute('href', url);
	});
});

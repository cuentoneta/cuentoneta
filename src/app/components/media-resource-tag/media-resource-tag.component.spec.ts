import { MediaResourceTagComponent } from './media-resource-tag.component';
import { render, screen } from '@testing-library/angular';

describe('MediaResourceTagComponent', () => {
	const setup = async () => {
		return await render(MediaResourceTagComponent, {
			inputs: {
				platform: {
					title: 'Posee contenido multimedia',
					icon: 'media',
				},
				size: 'md',
			},
		});
	};

	it('should render the component', async () => {
		const { container } = await setup();
		expect(container).toBeInTheDocument();
	});

	it('should render the platform icon', async () => {
		await setup();
		const icon = screen.getByRole('img');
		expect(icon).toHaveAttribute('src', 'media');
	});
});

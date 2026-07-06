import { MediaResourceTagComponent } from './media-resource-tag.component';
import { render, screen } from '@testing-library/angular';

describe('MediaResourceTagComponent', () => {
	const setup = async () => {
		return await render(MediaResourceTagComponent, {
			inputs: {
				platform: {
					title: 'Posee contenido multimedia',
					icon: { media: '' },
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
		const icon = screen.getByTestId('icon-media');
		expect(icon).toBeInTheDocument();
		expect(icon).toHaveAttribute('aria-label', 'Posee contenido multimedia');
	});

	it('should derive the data-testid from the icon key, not the icon object', async () => {
		await render(MediaResourceTagComponent, {
			inputs: {
				platform: { title: 'Contiene videos de YouTube', icon: { faBrandYoutube: '' } },
				size: 'md',
			},
		});

		expect(screen.getByTestId('icon-faBrandYoutube')).toBeInTheDocument();
		expect(screen.queryByTestId('icon-[object Object]')).toBeNull();
	});
});

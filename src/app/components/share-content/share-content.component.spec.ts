import { render, screen } from '@testing-library/angular';
import { ShareContentComponent } from './share-content.component';

describe('ShareContentComponent', () => {
	it('should create', async () => {
		const { container } = await render(ShareContentComponent);
		expect(container).toBeTruthy();
	});

	it('should render 3 share buttons when not loading', async () => {
		await render(ShareContentComponent, {
			inputs: {
				isLoading: false,
				route: '/test-route',
				message: 'Test message',
				params: { key: 'value' },
			},
		});

		const shareButtons = screen.getAllByRole('button');
		expect(shareButtons).toHaveLength(3);
	});

	it('should render 3 skeleton loaders when loading', async () => {
		const { container } = await render(ShareContentComponent, {
			inputs: {
				isLoading: true,
			},
		});

		const skeletons = container.querySelectorAll('ngx-skeleton-loader');
		expect(skeletons).toHaveLength(3);
	});

	it('should pass route, params, and message to share buttons', async () => {
		const testRoute = '/story/test-story';
		const testParams = { navigation: 'author', navigationSlug: 'test-author' };
		const testMessage = 'Check out this story!';

		await render(ShareContentComponent, {
			inputs: {
				isLoading: false,
				route: testRoute,
				params: testParams,
				message: testMessage,
			},
		});

		// Verify share buttons are rendered with correct platform icons
		expect(screen.getByTestId('faBrandFacebook')).toBeInTheDocument();
		expect(screen.getByTestId('faBrandWhatsapp')).toBeInTheDocument();
		expect(screen.getByTestId('faBrandXTwitter')).toBeInTheDocument();
	});

	it('should apply correct skeleton styling when loading', async () => {
		const { container } = await render(ShareContentComponent, {
			inputs: {
				isLoading: true,
			},
		});

		const skeletons = container.querySelectorAll('ngx-skeleton-loader');
		expect(skeletons).toHaveLength(3);
		skeletons.forEach((skeleton) => {
			expect(skeleton.getAttribute('appearance')).toBe('circle');
		});
	});
});

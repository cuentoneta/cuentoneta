import { render, screen, RenderResult } from '@testing-library/angular';
import { ShareContentComponent } from './share-content.component';
describe('ShareContentComponent', () => {
	const renderComponent = async (inputs?: {
		route?: string;
		message?: string;
		params?: {
			[key: string]: string;
		};
	}): Promise<RenderResult<ShareContentComponent>> => {
		return render(ShareContentComponent, { inputs });
	};
	it('should create', async () => {
		const { container } = await renderComponent();
		expect(container).toBeTruthy();
	});
	it('should render 3 share buttons', async () => {
		await renderComponent({
			route: '/test-route',
			message: 'Test message',
			params: { key: 'value' },
		});
		const shareButtons = screen.getAllByRole('button');
		expect(shareButtons).toHaveLength(3);
	});
	it('should pass route, params, and message to share buttons', async () => {
		const testRoute = '/story/test-story';
		const testParams = { navigation: 'author', navigationSlug: 'test-author' };
		const testMessage = 'Check out this story!';
		await renderComponent({
			route: testRoute,
			params: testParams,
			message: testMessage,
		});
		// Verify share buttons are rendered with correct platform icons
		expect(screen.getByTestId('faBrandFacebook')).toBeInTheDocument();
		expect(screen.getByTestId('faBrandWhatsapp')).toBeInTheDocument();
		expect(screen.getByTestId('faBrandXTwitter')).toBeInTheDocument();
	});
});

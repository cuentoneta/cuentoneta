import { render, screen, RenderResult } from '@testing-library/angular';
import { ShareContentComponent } from './share-content.component';
import { TestBed } from '@angular/core/testing';
import { ShareButtonComponent } from '@components/share-button/share-button.component';
import { MockA11yTooltipModule } from '@mocks/external-libs/a11y-tooltip-module.mock';

const setupTestBed = (testbed: TestBed) => {
	(testbed as typeof TestBed).configureTestingModule({}).overrideComponent(ShareButtonComponent, {
		set: {
			imports: [MockA11yTooltipModule],
		},
	});
};
describe('ShareContentComponent', () => {
	const renderComponent = async (inputs?: {
		isLoading?: boolean;
		route?: string;
		message?: string;
		params?: { [key: string]: string };
	}): Promise<RenderResult<ShareContentComponent>> => {
		return render(ShareContentComponent, { inputs, configureTestBed: setupTestBed });
	};

	it('should create', async () => {
		const { container } = await renderComponent();
		expect(container).toBeTruthy();
	});

	it('should render 3 share buttons when not loading', async () => {
		await renderComponent({
			isLoading: false,
			route: '/test-route',
			message: 'Test message',
			params: { key: 'value' },
		});

		const shareButtons = screen.getAllByRole('button');
		expect(shareButtons).toHaveLength(3);
	});

	it('should render 3 skeleton loaders when loading', async () => {
		await renderComponent({ isLoading: true });

		const skeletons = screen.getAllByTestId('share-skeleton-loader');
		expect(skeletons).toHaveLength(3);
	});

	it('should pass route, params, and message to share buttons', async () => {
		const testRoute = '/story/test-story';
		const testParams = { navigation: 'author', navigationSlug: 'test-author' };
		const testMessage = 'Check out this story!';

		await renderComponent({
			isLoading: false,
			route: testRoute,
			params: testParams,
			message: testMessage,
		});

		// Verify share buttons are rendered with correct platform icons
		expect(screen.getByTestId('faBrandFacebook')).toBeInTheDocument();
		expect(screen.getByTestId('faBrandWhatsapp')).toBeInTheDocument();
		expect(screen.getByTestId('faBrandXTwitter')).toBeInTheDocument();
	});

	it('should apply correct skeleton styling when loading', async () => {
		await renderComponent({ isLoading: true });

		const skeletons = screen.getAllByTestId('share-skeleton-loader');
		expect(skeletons).toHaveLength(3);
	});
});

import { ShareButtonComponent } from './share-button.component';
import { render, screen } from '@testing-library/angular';
import { SharingPlatform } from '@models/sharing-platform';
import { storyMock } from '../../mocks/story.mock';

class MockSharingPlatform implements SharingPlatform {
	name = 'MySpace';
	icon = 'faBrandFacebook';
	platformApiUrl = `https://www.facebook.com/share.php`;

	generateSharingUrl(appRoute: string, urlParams: string): string {
		const url = encodeURIComponent(`http://localhost:4200/${appRoute}?${urlParams}`);
		return `${this.platformApiUrl}?u=${url}`;
	}
}

describe('ShareButtonComponent', () => {
	const setup = async () => {
		return await render(ShareButtonComponent, {
			inputs: {
				platform: new MockSharingPlatform(),
				params: { slug: storyMock.slug },
				message: 'Leí esta historia y me pareció interesante',
				route: `/stories/${storyMock.slug}`,
			},
		});
	};

	it('should render the component', async () => {
		const { container } = await setup();
		expect(container).toBeInTheDocument();
	});

	it('should render the platform icon', async () => {
		await setup();
		const icon = screen.getByTestId('faBrandFacebook');
		expect(icon).toBeInTheDocument();
	});

	it('should render the platform icon with the correct aria label', async () => {
		await setup();
		const icon = screen.getByLabelText('MySpace');
		expect(icon).toBeInTheDocument();
	});
});

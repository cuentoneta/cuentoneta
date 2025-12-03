import { ShareButtonComponent } from './share-button.component';
import { render, screen } from '@testing-library/angular';
import { SharingPlatform } from '@models/sharing-platform';
import { storyMock } from '../../mocks/story.mock';
import { faBrandFacebook } from '@ng-icons/font-awesome/brands';
import { TestBed } from '@angular/core/testing';
import { MockA11yTooltipModule } from '@mocks/external-libs/a11y-tooltip-module.mock';

class MockSharingPlatform implements SharingPlatform {
	name = 'MySpace';
	icon = { faBrandFacebook };
	platformApiUrl = `https://www.facebook.com/share.php`;

	generateSharingUrl(appRoute: string, urlParams: string): string {
		const url = encodeURIComponent(`http://localhost:4200/${appRoute}?${urlParams}`);
		return `${this.platformApiUrl}?u=${url}`;
	}
}

const setupTestBed = (testbed: TestBed) => {
	(testbed as typeof TestBed).configureTestingModule({}).overrideComponent(ShareButtonComponent, {
		set: {
			imports: [MockA11yTooltipModule],
		},
	});
};

describe('ShareButtonComponent', () => {
	const setup = async () => {
		return await render(ShareButtonComponent, {
			inputs: {
				platform: new MockSharingPlatform(),
				params: { slug: storyMock.slug },
				message: 'Leí esta historia y me pareció interesante',
				route: `/stories/${storyMock.slug}`,
			},
			configureTestBed: setupTestBed,
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
});

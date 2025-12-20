import { render, screen } from '@testing-library/angular';
import { NavigableStorylistStoryTeaserComponent } from './navigable-storylist-story-teaser.component';
import { storyMock, storyNavigationTeaserWithAuthorMock } from '@mocks/story.mock';
import { storylistNavigationTeaserMock } from '@mocks/storylistMock';

describe('NavigableStorylistStoryTeaserComponent', () => {
	const authorName = storyMock.author.name;
	const storyTitle = storyMock.title;

	const RegExpAuthorName = new RegExp(`\\b${authorName}\\b`, 'iu');
	const RegExpStoryTitle = new RegExp(`${storyTitle}`, 'i');

	const setup = async () => {
		return await render(NavigableStorylistStoryTeaserComponent, {
			inputs: {
				story: storyNavigationTeaserWithAuthorMock,
				selected: true,
				storylist: storylistNavigationTeaserMock,
			},
		});
	};
	it('should render the component', async () => {
		const { container } = await setup();
		expect(container).toBeInTheDocument();
	});
	it('should render title and author', async () => {
		await setup();

		const authorResourceElement = screen.getByText(RegExpAuthorName);
		const titleResourceElement = screen.getByText(RegExpStoryTitle);

		expect(authorResourceElement).toBeInTheDocument();
		expect(titleResourceElement).toBeInTheDocument();
	});
});

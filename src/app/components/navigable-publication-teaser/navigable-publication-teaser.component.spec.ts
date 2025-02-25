import { render, screen } from '@testing-library/angular';
import { NavigablePublicationTeaserComponent } from './navigable-publication-teaser.component';
import { publicationMock, publicationNavigationTeaserMock } from '../../mocks/story.mock';
import { DatePipe } from '@angular/common';
import { storylistNavigationTeaserMock } from '../../mocks/storylist.mock';

describe('NavigablePublicationTeaserComponent', () => {
	const authorName = publicationMock.story.author.name;
	const storyTitle = publicationMock.story.title;

	const RegExpAuthorName = new RegExp(`\\b${authorName}\\b`, 'iu');
	const RegExpStoryTitle = new RegExp(`${storyTitle}`, 'i');

	const setup = async () => {
		return await render(NavigablePublicationTeaserComponent, {
			inputs: {
				publication: publicationNavigationTeaserMock,
				selected: true,
				storylist: storylistNavigationTeaserMock,
			},
			providers: [DatePipe],
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

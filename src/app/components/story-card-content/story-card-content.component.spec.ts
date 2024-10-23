import { render, screen } from '@testing-library/angular';
import { StoryCardContentComponent } from './story-card-content.component';
import { storyMock } from 'src/app/mocks/story.mock';

describe('StoryCardContentComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(StoryCardContentComponent, {
			inputs: { title: storyMock.title, body: storyMock.paragraphs },
		});

		expect(container).toBeInTheDocument();
	});

	it('should display the title', async () => {
		await render(StoryCardContentComponent, {
			inputs: { title: storyMock.title, body: storyMock.paragraphs },
		});

		const titleElement = screen.getByText(storyMock.title);
		expect(titleElement).toBeInTheDocument();
	});

	it('should display the body content', async () => {
		await render(StoryCardContentComponent, {
			inputs: { title: storyMock.title, body: storyMock.paragraphs },
		});

		const bodyElement = screen.getByText(storyMock.paragraphs[0].children[0].text);
		expect(bodyElement).toBeInTheDocument();
	});

	it('should apply the correct CSS classes to the content title', async () => {
		const { container } = await render(StoryCardContentComponent, {
			inputs: { title: storyMock.title, body: storyMock.paragraphs },
		});

		const titleElement = container.querySelector('h1');
		expect(titleElement).toHaveClass('inter-body-xl-bold mb-1 overflow-hidden text-ellipsis whitespace-nowrap');
	});

	it('should apply the correct CSS classes to the content body', async () => {
		const { container } = await render(StoryCardContentComponent, {
			inputs: { title: storyMock.title, body: storyMock.paragraphs },
		});

		const bodyElement = container.querySelector('cuentoneta-portable-text-parser');
		expect(bodyElement).toHaveClass(
			'sm:source-serif-pro-body-base hidden sm:relative sm:line-clamp-3 sm:min-h-18 sm:text-ellipsis sm:text-justify',
		);
	});
});

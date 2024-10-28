import { render, screen } from '@testing-library/angular';
import { StoryCardContentComponent } from './story-card-content.component';
import { storyMock } from 'src/app/mocks/story.mock';

const firstParagraph =
	'Marie se detuvo frente al antiguo espejo de su abuela, sus dedos temblorosos rozando el marco de madera tallada. El reflejo que le devolvía la mirada no era el suyo, sino el de una joven de ojos brillantes y sonrisa despreocupada. Marie, ahora con 60 años, reconoció a su yo de 20.';

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

		const bodyElement = screen.getByText(firstParagraph);
		expect(bodyElement).toBeInTheDocument();
	});

	it('should apply the correct CSS classes to the content title', async () => {
		await render(StoryCardContentComponent, {
			inputs: { title: storyMock.title, body: storyMock.paragraphs },
		});

		const titleElement = screen.getByRole('heading');
		expect(titleElement).toHaveClass('inter-body-xl-bold mb-1 overflow-hidden text-ellipsis whitespace-nowrap');
	});

	it('should apply the correct CSS classes to the content body', async () => {
		await render(StoryCardContentComponent, {
			inputs: { title: storyMock.title, body: storyMock.paragraphs },
		});

		const bodyElement = screen.getByTestId('portable-text-parser');
		expect(bodyElement).toHaveClass(
			'sm:source-serif-pro-body-base hidden sm:relative sm:line-clamp-3 sm:min-h-18 sm:text-ellipsis sm:text-justify',
		);
	});
});

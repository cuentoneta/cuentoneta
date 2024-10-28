import { render, screen } from '@testing-library/angular';
import { StoryCardComponent } from './story-card.component';
import { storyPreviewMock } from '../../mocks/story.mock';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';

describe('StoryCardComponent', () => {
	let urlTree: UrlTree;

	beforeEach(() => {
		const urlSerializer = new DefaultUrlSerializer();
		urlTree = urlSerializer.parse('/story/el-espejo-del-tiempo?navigation=author&navigationSlug=francois-onoff');
	});

	it('should render the component', async () => {
		const { container } = await render(StoryCardComponent, {
			componentInputs: {
				story: storyPreviewMock,
				navigationRoute: urlTree,
			},
		});
		expect(container).toBeTruthy();
	});
	it('should display the mock story title', async () => {
		await render(StoryCardComponent, {
			componentInputs: {
				story: storyPreviewMock,
				navigationRoute: urlTree,
			},
		});
		const resourceElement = screen.getByText(storyPreviewMock.title);
		expect(resourceElement).toBeInTheDocument();
	});
	it('should display the approximate reading time', async () => {
		await render(StoryCardComponent, {
			componentInputs: {
				story: storyPreviewMock,
				navigationRoute: urlTree,
			},
		});
		const readingTimeElement = screen.getByText(`${storyPreviewMock.approximateReadingTime} minutos de lectura`);
		expect(readingTimeElement).toBeInTheDocument();
	});
});

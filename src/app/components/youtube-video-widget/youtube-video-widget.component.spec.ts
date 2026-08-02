import { render, screen } from '@testing-library/angular';
import { YoutubeVideoWidgetComponent } from './youtube-video-widget.component';
import { mediaDescriptionText, onoffYouTubeVideosMock } from '@mocks/onoff-media.mock';

describe('YoutubeVideoWidgetComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(YoutubeVideoWidgetComponent, {
			inputs: { media: onoffYouTubeVideosMock[0] },
		});

		expect(container).toBeInTheDocument();
	});

	// El widget no pinta el título del medio: solo el embed y la descripción. La aserción que antes lo daba
	// por renderizado pasaba porque el fixture repetía el mismo texto en ambos campos.
	it('should not display the video title', async () => {
		await render(YoutubeVideoWidgetComponent, {
			inputs: { media: onoffYouTubeVideosMock[0] },
		});

		expect(screen.queryByText(onoffYouTubeVideosMock[0].title)).not.toBeInTheDocument();
	});

	it('should display the YouTube video description', async () => {
		await render(YoutubeVideoWidgetComponent, {
			inputs: { media: onoffYouTubeVideosMock[0] },
		});

		expect(screen.getByText(mediaDescriptionText(onoffYouTubeVideosMock[0]))).toBeInTheDocument();
	});
});

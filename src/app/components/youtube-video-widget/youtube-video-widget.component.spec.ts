import { render, screen } from '@testing-library/angular';
import { YoutubeVideoWidgetComponent } from './youtube-video-widget.component';
import { youtubeVideoMock } from '../../mocks/youtube-video.mock';

describe('YoutubeVideoWidgetComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(YoutubeVideoWidgetComponent, {
			inputs: { media: youtubeVideoMock },
		});

		expect(container).toBeInTheDocument();
	});

	it('should display the video title', async () => {
		await render(YoutubeVideoWidgetComponent, {
			inputs: { media: youtubeVideoMock },
		});

		expect(screen.getByText('Video alusivo a la narración de "El espejo del tiempo".')).toBeInTheDocument();
	});
});

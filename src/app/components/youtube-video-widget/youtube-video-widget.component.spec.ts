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

	// El contenedor no puede ser un p: el pipeline emite <p>…</p> y anidar un párrafo dentro de otro es
	// HTML inválido que el navegador reacomoda, rompiendo el estilado sin que nada falle en el test.
	it('should display the YouTube video description in a figcaption', async () => {
		await render(YoutubeVideoWidgetComponent, {
			inputs: { media: onoffYouTubeVideosMock[0] },
		});

		const description = screen.getByTestId('media-description');

		expect(description.tagName.toLowerCase()).toBe('figcaption');
		expect(description.textContent?.trim()).toBe(mediaDescriptionText(onoffYouTubeVideosMock[0]));
	});
});

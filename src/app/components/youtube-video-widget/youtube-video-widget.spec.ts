import { render, screen, within } from '@testing-library/angular';
import { YoutubeVideoWidget } from './youtube-video-widget';
import { mediaDescriptionText, onoffYouTubeVideosMock } from '@mocks/onoff-media.mock';
import { createMarkdown } from '@models/markdown.model';
import { installMarkdownLinksSheet } from '@testing/markdown-links-sheet';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

describe('YoutubeVideoWidget', () => {
	beforeEach(installMarkdownLinksSheet);

	it('should render the component', async () => {
		const { container } = await render(YoutubeVideoWidget, {
			inputs: { media: onoffYouTubeVideosMock[0] },
		});

		expect(container).toBeInTheDocument();
	});

	// El contenedor no puede ser un p: el pipeline emite <p>…</p> y anidar un párrafo dentro de otro es
	// HTML inválido que el navegador reacomoda, rompiendo el estilado sin que nada falle en el test.
	it('should display the YouTube video description in a figcaption', async () => {
		await render(YoutubeVideoWidget, {
			inputs: { media: onoffYouTubeVideosMock[0] },
		});

		const description = screen.getByTestId('media-description');

		expect(description.tagName.toLowerCase()).toBe('figcaption');
		expect(description.textContent?.trim()).toBe(mediaDescriptionText(onoffYouTubeVideosMock[0]));
	});

	it('should underline the links of the YouTube video description', async () => {
		const label = 'más información';
		const media = {
			...onoffYouTubeVideosMock[0],
			description: markdownToSanitizedHtml(createMarkdown(`Ver [${label}](https://example.com).`)),
		};

		await render(YoutubeVideoWidget, { inputs: { media } });

		const link = within(screen.getByTestId('media-description')).getByRole('link', { name: label });
		expect(link).toHaveStyle('text-decoration-line: underline');
	});
});

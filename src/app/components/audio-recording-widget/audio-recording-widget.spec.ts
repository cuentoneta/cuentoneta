// Testing library
import { render, screen, within } from '@testing-library/angular';

// Component
import { AudioRecordingWidget } from './audio-recording-widget';

// Mocks
import { mediaDescriptionText, onoffAudioRecordingsMock } from '@mocks/onoff-media.mock';

// Modelos y utilidades
import { createMarkdown } from '@models/markdown.model';
import { installMarkdownLinksSheet } from '@testing/markdown-links-sheet';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

describe('AudioRecordingWidget', () => {
	beforeEach(installMarkdownLinksSheet);

	it('should render the component', async () => {
		const { container } = await render(AudioRecordingWidget, {
			inputs: { media: onoffAudioRecordingsMock[0] },
		});

		expect(container).toBeInTheDocument();
	});

	it('should render the audio player', async () => {
		await render(AudioRecordingWidget, {
			inputs: { media: onoffAudioRecordingsMock[0] },
		});

		const audioRecordingElement = screen.getByTestId('audio-recording');

		expect(audioRecordingElement.getAttribute('src')).toBe(onoffAudioRecordingsMock[0].data.url);
	});

	// El contenedor no puede ser un p: el pipeline emite <p>…</p> y anidar un párrafo dentro de otro es
	// HTML inválido que el navegador reacomoda, rompiendo el estilado sin que nada falle en el test.
	it('should display the audio recording description in a figcaption', async () => {
		await render(AudioRecordingWidget, {
			inputs: { media: onoffAudioRecordingsMock[0] },
		});

		const description = screen.getByTestId('media-description');

		expect(description.tagName.toLowerCase()).toBe('figcaption');
		expect(description.textContent?.trim()).toBe(mediaDescriptionText(onoffAudioRecordingsMock[0]));
	});

	it('should underline the links of the audio recording description', async () => {
		const label = 'más información';
		const media = {
			...onoffAudioRecordingsMock[0],
			description: markdownToSanitizedHtml(createMarkdown(`Ver [${label}](https://example.com).`)),
		};

		await render(AudioRecordingWidget, { inputs: { media } });

		const link = within(screen.getByTestId('media-description')).getByRole('link', { name: label });
		expect(link).toHaveStyle('text-decoration-line: underline');
	});
});

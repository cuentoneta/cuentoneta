// Testing library
import { render, screen } from '@testing-library/angular';

// Component
import { AudioRecordingWidgetComponent } from './audio-recording-widget.component';

// Mocks
import { mediaDescriptionText, onoffAudioRecordingsMock } from '@mocks/onoff-media.mock';

describe('AudioRecordingWidgetComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(AudioRecordingWidgetComponent, {
			inputs: { media: onoffAudioRecordingsMock[0] },
		});

		expect(container).toBeInTheDocument();
	});

	it('should render the audio player', async () => {
		await render(AudioRecordingWidgetComponent, {
			inputs: { media: onoffAudioRecordingsMock[0] },
		});

		const audioRecordingElement = screen.getByTestId('audio-recording') as HTMLElement & { currentSrc: string };
		expect(audioRecordingElement.currentSrc === onoffAudioRecordingsMock[0].data.url).toBeTruthy();
	});

	// El contenedor es un div, no un p: el pipeline emite <p>…</p> y anidar un párrafo dentro de otro es
	// HTML inválido que el navegador reacomoda, rompiendo el estilado sin que nada falle en el test.
	it('should display the audio recording description in a div container', async () => {
		await render(AudioRecordingWidgetComponent, {
			inputs: { media: onoffAudioRecordingsMock[0] },
		});

		const description = screen.getByTestId('media-description');

		expect(description.tagName.toLowerCase()).toBe('div');
		expect(description.textContent?.trim()).toBe(mediaDescriptionText(onoffAudioRecordingsMock[0]));
	});
});

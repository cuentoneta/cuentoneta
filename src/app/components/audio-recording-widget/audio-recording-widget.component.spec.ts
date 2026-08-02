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

	// El widget no pinta el título del medio: solo el reproductor y la descripción. La aserción que antes
	// lo daba por renderizado pasaba porque el fixture repetía el mismo texto en ambos campos.
	it('should not display the audio recording title', async () => {
		await render(AudioRecordingWidgetComponent, {
			inputs: { media: onoffAudioRecordingsMock[0] },
		});

		expect(screen.queryByText(onoffAudioRecordingsMock[0].title)).not.toBeInTheDocument();
	});

	it('should display the audio recording description', async () => {
		await render(AudioRecordingWidgetComponent, {
			inputs: { media: onoffAudioRecordingsMock[0] },
		});

		expect(screen.getByText(mediaDescriptionText(onoffAudioRecordingsMock[0]))).toBeInTheDocument();
	});
});

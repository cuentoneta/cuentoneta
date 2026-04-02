// Testing library
import { render, screen } from '@testing-library/angular';

// Component
import { AudioRecordingWidgetComponent } from './audio-recording-widget.component';

// Mocks
import { audioRecordingMock } from '../../mocks/audio-recording.mock';

describe('AudioRecordingWidgetComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(AudioRecordingWidgetComponent, {
			inputs: { media: audioRecordingMock },
		});

		expect(container).toBeInTheDocument();
	});

	it('should render the audio player', async () => {
		await render(AudioRecordingWidgetComponent, {
			inputs: { media: audioRecordingMock },
		});

		const audioRecordingElement = screen.getByTestId('audio-recording') as HTMLElement & { currentSrc: string };
		expect(audioRecordingElement.currentSrc === audioRecordingMock.data.url).toBeTruthy();
	});

	it('should display the audio recording title', async () => {
		await render(AudioRecordingWidgetComponent, {
			inputs: { media: audioRecordingMock },
		});

		expect(screen.getByText('Lectura del artículo sobre ajedrez en Wikipedia.')).toBeInTheDocument();
	});

	it('should display the audio recording description', async () => {
		await render(AudioRecordingWidgetComponent, {
			inputs: { media: audioRecordingMock },
		});

		expect(screen.getByText('Lectura del artículo sobre ajedrez en Wikipedia.')).toBeInTheDocument();
	});
});

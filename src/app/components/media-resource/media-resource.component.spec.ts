import { render, screen } from '@testing-library/angular';
import { MediaResourceComponent } from './media-resource.component';
import { AudioRecording, Media, MediaTypes, SpaceRecording, YouTubeVideo } from '@models/media.model';
import { AudioRecordingWidgetComponent } from '../audio-recording-widget/audio-recording-widget.component';
import { SpaceRecordingWidgetComponent } from '../space-recording-widget/space-recording-widget.component';
import { YoutubeVideoWidgetComponent } from '../youtube-video-widget/youtube-video-widget.component';

// Mocks
import { youtubeVideoMock } from '../../mocks/youtube-video.mock';
import { audioRecordingMock } from '../../mocks/audio-recording.mock';
import { spaceRecordingMock } from '../../mocks/space-recording.mock';

const mockMediaResources: Media[] = [
	audioRecordingMock as AudioRecording,
	spaceRecordingMock as SpaceRecording,
	youtubeVideoMock as YouTubeVideo,
];

describe('MediaResourceComponent', () => {
	test('should render MediaResourceComponent', async () => {
		const { container } = await render(MediaResourceComponent, {
			componentInputs: { mediaResources: mockMediaResources },
			imports: [AudioRecordingWidgetComponent, SpaceRecordingWidgetComponent, YoutubeVideoWidgetComponent],
		});

		expect(container).toBeTruthy();
	});

	test('should render all types of media widgets', async () => {
		await render(MediaResourceComponent, {
			componentInputs: { mediaResources: mockMediaResources },
			imports: [AudioRecordingWidgetComponent, SpaceRecordingWidgetComponent, YoutubeVideoWidgetComponent],
		});

		// Verificar que se renderiza el widget de audio
		expect(screen.getByText('Lectura del artículo sobre ajedrez en Wikipedia.')).toBeInTheDocument();

		// Verificar que se renderiza el widget de space recording
		expect(screen.getByText('El marajá de San Telmo: discusión y breve análisis')).toBeInTheDocument();

		// Verificar que se renderiza el widget de YouTube video
		expect(screen.getByText('Video alusivo a la narración de "El espejo del tiempo".')).toBeInTheDocument();
	});

	test('should render an AudioRecordingWidgetComponent for audio recordings', async () => {
		await render(MediaResourceComponent, {
			componentInputs: { mediaResources: [mockMediaResources[0]] },
			imports: [AudioRecordingWidgetComponent],
		});

		expect(screen.getByText('Lectura del artículo sobre ajedrez en Wikipedia.')).toBeInTheDocument();
	});

	test('should render a SpaceRecordingWidgetComponent for space recordings', async () => {
		await render(MediaResourceComponent, {
			componentInputs: { mediaResources: [mockMediaResources[1]] },
			imports: [SpaceRecordingWidgetComponent],
		});

		expect(screen.getByText('El marajá de San Telmo: discusión y breve análisis')).toBeInTheDocument();
	});

	test('should render a YoutubeVideoWidgetComponent for YouTube videos', async () => {
		await render(MediaResourceComponent, {
			componentInputs: { mediaResources: [mockMediaResources[2]] },
			imports: [YoutubeVideoWidgetComponent],
		});

		expect(screen.getByText('Video alusivo a la narración de "El espejo del tiempo".')).toBeInTheDocument();
	});

	test('should throw an error for unsupported media types', async () => {
		const unsupportedMedia = [{ type: 'unsupportedType', id: '4', title: 'Unsupported Media' }];

		await expect(
			render(MediaResourceComponent, {
				componentInputs: { mediaResources: unsupportedMedia as any },
			}),
		).rejects.toThrow('El tipo unsupportedType no está soportado.');
	});
});

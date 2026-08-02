import { render, screen } from '@testing-library/angular';
import { MediaResourceComponent } from './media-resource.component';
import type { Media } from '@models/media.model';
import { AudioRecordingWidgetComponent } from '../audio-recording-widget/audio-recording-widget.component';
import { SpaceRecordingWidgetComponent } from '../space-recording-widget/space-recording-widget.component';
import { YoutubeVideoWidgetComponent } from '../youtube-video-widget/youtube-video-widget.component';
import { SpotifyPodcastEpisodeWidget } from '@components/spotify-audio-widget/spotify-podcast-episode-widget';

// Mocks
import {
	mediaDescriptionText,
	onoffAudioRecordingsMock,
	onoffSpaceRecordingsMock,
	onoffSpotifyPodcastEpisodesMock,
	onoffYouTubeVideosMock,
} from '@mocks/onoff-media.mock';

const mockMediaResources: Media[] = [
	onoffAudioRecordingsMock[0],
	onoffSpaceRecordingsMock[0],
	onoffYouTubeVideosMock[0],
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
		expect(screen.getByText(mediaDescriptionText(onoffAudioRecordingsMock[0]))).toBeInTheDocument();

		// Verificar que se renderiza el widget de space recording
		expect(screen.getByText(onoffSpaceRecordingsMock[0].title)).toBeInTheDocument();

		// Verificar que se renderiza el widget de YouTube video
		expect(screen.getByText(mediaDescriptionText(onoffYouTubeVideosMock[0]))).toBeInTheDocument();
	});

	test('should render an AudioRecordingWidgetComponent for audio recordings', async () => {
		await render(MediaResourceComponent, {
			componentInputs: { mediaResources: [mockMediaResources[0]] },
			imports: [AudioRecordingWidgetComponent],
		});

		expect(screen.getByText(mediaDescriptionText(onoffAudioRecordingsMock[0]))).toBeInTheDocument();
	});

	test('should render a SpaceRecordingWidgetComponent for space recordings', async () => {
		await render(MediaResourceComponent, {
			componentInputs: { mediaResources: [mockMediaResources[1]] },
			imports: [SpaceRecordingWidgetComponent],
		});

		expect(screen.getByText(onoffSpaceRecordingsMock[0].title)).toBeInTheDocument();
	});

	test('should render a YoutubeVideoWidgetComponent for YouTube videos', async () => {
		await render(MediaResourceComponent, {
			componentInputs: { mediaResources: [mockMediaResources[2]] },
			imports: [YoutubeVideoWidgetComponent],
		});

		expect(screen.getByText(mediaDescriptionText(onoffYouTubeVideosMock[0]))).toBeInTheDocument();
	});

	test('should render a SpotifyPodcastEpisodeWidget for podcast episodes', async () => {
		await render(MediaResourceComponent, {
			componentInputs: { mediaResources: [onoffSpotifyPodcastEpisodesMock[0]] },
			imports: [SpotifyPodcastEpisodeWidget],
		});

		// Por el embed y no por la descripción: esa la pinta el mismo parser en los cuatro widgets, así
		// que la aserción pasaría igual si el registry resolviera el widget equivocado.
		expect(screen.getByTestId('spotify-embed')).toBeTruthy();
	});

	test('should throw an error for unsupported media types', async () => {
		const unsupportedMedia = [{ type: 'unsupportedType', id: '4', title: 'Unsupported Media' }];

		await expect(
			render(MediaResourceComponent, {
				componentInputs: { mediaResources: unsupportedMedia },
			}),
		).rejects.toThrow('El tipo unsupportedType no está soportado.');
	});
});

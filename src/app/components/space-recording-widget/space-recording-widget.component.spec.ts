import { SpaceRecordingWidgetComponent } from './space-recording-widget.component';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { render, screen } from '@testing-library/angular';
import { CommonModule, DatePipe, NgOptimizedImage } from '@angular/common';
import { SpaceRecording } from '@models/media.model';
import { mediaDescriptionText, onoffSpaceRecordingsMock } from '@mocks/onoff-media.mock';

describe('SpaceRecordingWidgetComponent', () => {
	const setup = async (media: SpaceRecording = onoffSpaceRecordingsMock[0]) => {
		return await render(SpaceRecordingWidgetComponent, {
			componentImports: [CommonModule, NgOptimizedImage, PortableTextParserComponent],
			componentProviders: [],
			inputs: {
				media,
			},
		});
	};

	test('should render SpaceRecordingWidgetComponent', async () => {
		expect(await setup()).toBeTruthy();
	});

	it('should display the correct title', async () => {
		await setup();
		expect(screen.getByText(onoffSpaceRecordingsMock[0].title)).toBeInTheDocument();
	});

	it('should display the host name', async () => {
		await setup();
		expect(screen.getByText(onoffSpaceRecordingsMock[0].data.hostName)).toBeInTheDocument();
	});

	it('should display the "Anfitrión" badge', async () => {
		await setup();
		expect(screen.getByText(onoffSpaceRecordingsMock[0].title)).toBeInTheDocument();
	});

	it('should display the recording date', async () => {
		await setup();
		const datePipe = new DatePipe('en-US');
		const date = datePipe.transform(onoffSpaceRecordingsMock[0].data.date, 'MMMM d, yyyy', 'UTC') as string;
		expect(screen.getByText(date)).toBeInTheDocument();
	});

	it('should display the recording duration', async () => {
		await setup();
		expect(screen.getByText(onoffSpaceRecordingsMock[0].data.duration)).toBeInTheDocument();
	});

	it('should render an audio player with the correct source', async () => {
		await setup();
		const audio = screen.getByTestId('space-recording-audio');
		expect(audio).toHaveAttribute('src', onoffSpaceRecordingsMock[0].data.url);
	});

	it('should show a placeholder instead of the audio player when there is no recording URL', async () => {
		await setup({ ...onoffSpaceRecordingsMock[0], data: { ...onoffSpaceRecordingsMock[0].data, url: null } });
		expect(screen.getByTestId('space-recording-unavailable')).toBeInTheDocument();
		expect(screen.getByText('Grabación no disponible')).toBeInTheDocument();
		expect(screen.queryByTestId('space-recording-audio')).not.toBeInTheDocument();
	});

	it('should render the host avatar', async () => {
		await setup();
		const img = screen.getByRole('img');
		expect(img).toHaveAttribute('src', onoffSpaceRecordingsMock[0].data.hostAvatar);
	});

	it('should display the space recording description', async () => {
		await setup();

		expect(screen.getByText(mediaDescriptionText(onoffSpaceRecordingsMock[0]))).toBeInTheDocument();
	});
});

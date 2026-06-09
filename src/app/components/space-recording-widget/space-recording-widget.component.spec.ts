import { SpaceRecordingWidgetComponent } from './space-recording-widget.component';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';
import { render, screen, within } from '@testing-library/angular';
import { CommonModule, DatePipe, NgOptimizedImage } from '@angular/common';
import { spaceRecordingMock } from '../../mocks/space-recording.mock';
import { SpaceRecording } from '@models/media.model';

describe('SpaceRecordingWidgetComponent', () => {
	const setup = async (media: SpaceRecording = spaceRecordingMock) => {
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
		expect(screen.getByText(spaceRecordingMock.title)).toBeInTheDocument();
	});

	it('should display the host name', async () => {
		await setup();
		expect(screen.getByText(spaceRecordingMock.data.hostName)).toBeInTheDocument();
	});

	it('should display the "Anfitrión" badge', async () => {
		await setup();
		expect(screen.getByText('Anfitrión')).toBeInTheDocument();
	});

	it('should display the recording date', async () => {
		await setup();
		const datePipe = new DatePipe('en-US');
		const date = datePipe.transform(spaceRecordingMock.data.date, 'MMMM d, yyyy') as string;
		expect(screen.getByText(date)).toBeInTheDocument();
	});

	it('should display the recording duration', async () => {
		await setup();
		expect(screen.getByText(spaceRecordingMock.data.duration)).toBeInTheDocument();
	});

	it('should render an audio player with the correct source', async () => {
		await setup();
		const audio = screen.getByTestId('space-recording-audio');
		expect(audio).toHaveAttribute('src', spaceRecordingMock.data.url);
	});

	it('should show a placeholder instead of the audio player when there is no recording URL', async () => {
		await setup({ ...spaceRecordingMock, data: { ...spaceRecordingMock.data, url: null } });
		expect(screen.getByTestId('space-recording-unavailable')).toBeInTheDocument();
		expect(screen.getByText('Grabación no disponible')).toBeInTheDocument();
		expect(screen.queryByTestId('space-recording-audio')).not.toBeInTheDocument();
	});

	it('should render the host avatar', async () => {
		await setup();
		const img = screen.getByRole('img');
		expect(img).toHaveAttribute('src', spaceRecordingMock.data.hostAvatar);
	});

	it('should display the space recording description', async () => {
		await setup();
		expect(
			screen.getByText((content, element) => {
				return (
					element?.tagName.toLowerCase() === 'p' &&
					content.includes('Space de X organizado y dirigido por ') &&
					content.includes(' que incluye la lectura, análisis y discusión del cuento.') &&
					within(element as HTMLElement).getByText('@criticocultural') !== null
				);
			}),
		).toBeInTheDocument();
	});
});

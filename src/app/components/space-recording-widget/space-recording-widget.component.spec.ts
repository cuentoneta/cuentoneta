import { SpaceRecordingWidgetComponent } from './space-recording-widget.component';
import { render, screen, within } from '@testing-library/angular';
import { CommonModule, DatePipe, NgOptimizedImage } from '@angular/common';
import { SpaceRecording } from '@models/media.model';
import { mediaDescriptionText, onoffSpaceRecordingsMock } from '@mocks/onoff-media.mock';

describe('SpaceRecordingWidgetComponent', () => {
	const setup = async (media: SpaceRecording = onoffSpaceRecordingsMock[0]) => {
		return await render(SpaceRecordingWidgetComponent, {
			componentImports: [CommonModule, NgOptimizedImage],
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

	// El rótulo es un literal del template, no sale del fixture.
	it('should display the "Anfitrión" badge', async () => {
		await setup();
		expect(screen.getByText('Anfitrión')).toBeInTheDocument();
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

	// La descripción llega como HTML saneado y se pinta con [innerHTML]: se verifica el texto completo y
	// que el enlace del fixture sobreviva, para distinguir "se pintó el HTML" de "se pintó el string
	// escapado". El contenedor no puede ser un p: el pipeline emite <p>…</p> y anidarlo lo rompería.
	it('should display the space recording description as rendered HTML', async () => {
		await setup();

		const description = screen.getByTestId('media-description');

		expect(description.tagName.toLowerCase()).toBe('figcaption');
		expect(description.textContent?.trim()).toBe(mediaDescriptionText(onoffSpaceRecordingsMock[0]));
		expect(within(description).getByRole('link')).toHaveAttribute(
			'href',
			'https://cdn.example.org/onoff/geometria.pdf',
		);
	});
});

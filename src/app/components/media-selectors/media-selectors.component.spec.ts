import { fn } from '@test-utils';
import { MediaSelectorsComponent } from './media-selectors.component';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { MediaTeaser } from '@models/media.model';
import { onoffSpotifyPodcastEpisodesMock, onoffYouTubeVideosMock, toMediaTeaser } from '@mocks/onoff-media.mock';

describe('MediaSelectorsComponent', () => {
	// Dos medios de la misma plataforma más uno de otra: el caso que distingue "un selector por
	// plataforma" de "un selector por medio". El repetido sale del canon, no de un literal nuevo.
	const [youTube1] = onoffYouTubeVideosMock.map(toMediaTeaser);
	const [spotify1] = onoffSpotifyPodcastEpisodesMock.map(toMediaTeaser);
	const media: MediaTeaser[] = [
		...onoffYouTubeVideosMock,
		...onoffYouTubeVideosMock,
		...onoffSpotifyPodcastEpisodesMock,
	].map(toMediaTeaser);

	it('should render nothing when there is no media', async () => {
		await render(MediaSelectorsComponent, { inputs: { media: [] } });
		expect(screen.queryAllByTestId('media-selector')).toHaveLength(0);
	});

	describe('Grouped mode (selectable = false, default)', () => {
		it('should render one selector per platform', async () => {
			await render(MediaSelectorsComponent, { inputs: { media } });
			// 3 media items but only 2 distinct platforms (YouTube, Spotify) => 2 selectors.
			expect(screen.getAllByTestId('media-selector')).toHaveLength(2);
		});

		it('should show a count badge for platforms with more than one resource', async () => {
			await render(MediaSelectorsComponent, { inputs: { media } });
			// 2 YouTube videos => badge "2"; the single Spotify episode shows no badge.
			expect(screen.getByText('2')).toBeInTheDocument();
		});

		it('should render decorative (non-button) selectors', async () => {
			await render(MediaSelectorsComponent, { inputs: { media } });
			expect(screen.queryAllByRole('button')).toHaveLength(0);
		});

		it('should expose each selector as an image with the count folded into its accessible name', async () => {
			await render(MediaSelectorsComponent, { inputs: { media } });
			// El badge visual es decorativo: el conteo se anuncia en el nombre accesible del recuadro.
			expect(screen.getByRole('img', { name: 'YouTube (2)' })).toBeInTheDocument();
			expect(screen.getByRole('img', { name: 'Spotify' })).toBeInTheDocument();
		});
	});

	describe('Selectable mode (selectable = true)', () => {
		it('should render one clickable button per resource (no grouping)', async () => {
			await render(MediaSelectorsComponent, { inputs: { media, selectable: true } });
			// 3 resources => 3 buttons.
			expect(screen.getAllByRole('button')).toHaveLength(3);
		});

		it('should not render a count badge', async () => {
			await render(MediaSelectorsComponent, { inputs: { media, selectable: true } });
			expect(screen.queryByText('2')).not.toBeInTheDocument();
		});

		// Los dos primeros botones salen del mismo objeto repetido, así que por sí solos no distinguen
		// "emite el recurso del botón" de "emite siempre el primero": la correspondencia la prueba el
		// tercero, que es el único de otra plataforma.
		it('should emit the corresponding resource when a selector is clicked', async () => {
			const onSelected = fn();
			await render(MediaSelectorsComponent, {
				inputs: { media, selectable: true },
				on: { selected: onSelected },
			});
			const buttons = screen.getAllByRole('button');

			await userEvent.click(buttons[0]);
			expect(onSelected).toHaveBeenCalledTimes(1);
			expect(onSelected).toHaveBeenCalledWith(youTube1);

			await userEvent.click(buttons[2]);
			expect(onSelected).toHaveBeenCalledTimes(2);
			expect(onSelected).toHaveBeenLastCalledWith(spotify1);
		});

		it('should expose an accessible label per platform', async () => {
			await render(MediaSelectorsComponent, { inputs: { media, selectable: true } });
			expect(screen.getAllByLabelText('YouTube')).toHaveLength(2);
			expect(screen.getByLabelText('Spotify')).toBeInTheDocument();
		});
	});
});

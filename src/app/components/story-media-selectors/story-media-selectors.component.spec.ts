import { StoryMediaSelectorsComponent } from './story-media-selectors.component';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Media } from '@models/media.model';

describe('StoryMediaSelectorsComponent', () => {
	const youTube1: Media = { title: 'Video 1', type: 'youTubeVideo', description: [], data: { videoId: 'a' } };
	const youTube2: Media = { title: 'Video 2', type: 'youTubeVideo', description: [], data: { videoId: 'b' } };
	const spotify: Media = {
		title: 'Podcast',
		type: 'spotifyPodcastEpisode',
		description: [],
		data: { url: 'https://s' },
	};
	const media: Media[] = [youTube1, youTube2, spotify];

	it('should render nothing when there is no media', async () => {
		await render(StoryMediaSelectorsComponent, { inputs: { media: [] } });
		expect(screen.queryAllByTestId('media-selector')).toHaveLength(0);
	});

	describe('Grouped mode (selectable = false, default)', () => {
		it('should render one selector per platform', async () => {
			await render(StoryMediaSelectorsComponent, { inputs: { media } });
			// 3 media items but only 2 distinct platforms (YouTube, Spotify) => 2 selectors.
			expect(screen.getAllByTestId('media-selector')).toHaveLength(2);
		});

		it('should show a count badge for platforms with more than one resource', async () => {
			await render(StoryMediaSelectorsComponent, { inputs: { media } });
			// 2 YouTube videos => badge "2"; the single Spotify episode shows no badge.
			expect(screen.getByText('2')).toBeInTheDocument();
		});

		it('should render decorative (non-button) selectors', async () => {
			await render(StoryMediaSelectorsComponent, { inputs: { media } });
			expect(screen.queryAllByRole('button')).toHaveLength(0);
		});

		it('should expose each selector as an image with the count folded into its accessible name', async () => {
			await render(StoryMediaSelectorsComponent, { inputs: { media } });
			// El badge visual es decorativo: el conteo se anuncia en el nombre accesible del recuadro.
			expect(screen.getByRole('img', { name: 'YouTube (2)' })).toBeInTheDocument();
			expect(screen.getByRole('img', { name: 'Spotify' })).toBeInTheDocument();
		});
	});

	describe('Selectable mode (selectable = true)', () => {
		it('should render one clickable button per resource (no grouping)', async () => {
			await render(StoryMediaSelectorsComponent, { inputs: { media, selectable: true } });
			// 3 resources => 3 buttons.
			expect(screen.getAllByRole('button')).toHaveLength(3);
		});

		it('should not render a count badge', async () => {
			await render(StoryMediaSelectorsComponent, { inputs: { media, selectable: true } });
			expect(screen.queryByText('2')).not.toBeInTheDocument();
		});

		it('should emit the corresponding resource when a selector is clicked', async () => {
			const onSelected = jest.fn();
			await render(StoryMediaSelectorsComponent, {
				inputs: { media, selectable: true },
				on: { selected: onSelected },
			});
			const buttons = screen.getAllByRole('button');
			await userEvent.click(buttons[0]);
			expect(onSelected).toHaveBeenCalledTimes(1);
			expect(onSelected).toHaveBeenCalledWith(youTube1);
		});

		it('should expose an accessible label per platform', async () => {
			await render(StoryMediaSelectorsComponent, { inputs: { media, selectable: true } });
			expect(screen.getAllByLabelText('YouTube')).toHaveLength(2);
			expect(screen.getByLabelText('Spotify')).toBeInTheDocument();
		});
	});
});

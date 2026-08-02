import { render, screen, queryAllByAttribute } from '@testing-library/angular';
import { MediaResourceTagsComponent } from './media-resource-tags.component';
import { MediaResourcePlatform, MediaResourceTagComponent } from '../media-resource-tag/media-resource-tag.component';
import { CommonModule } from '@angular/common';
import { Media, MediaTypeKey } from '@models/media.model';
import { onoffAudioRecordingsMock, onoffSpaceRecordingsMock, onoffYouTubeVideosMock } from '@mocks/onoff-media.mock';

// Tres plataformas distintas del canon: es lo que el componente cuenta.
const mockMedia: Media[] = [...onoffAudioRecordingsMock, ...onoffSpaceRecordingsMock, ...onoffYouTubeVideosMock];

describe('MediaResourceTagsComponent', () => {
	it('should render the correct number of resource tags', async () => {
		const { container } = await render(MediaResourceTagsComponent, {
			imports: [CommonModule, MediaResourceTagComponent],
			inputs: {
				resources: mockMedia,
			},
		});

		const resourceTags = queryAllByAttribute('data-testid', container as HTMLElement, (value) =>
			value ? /icon-/.test(value) : false,
		);
		expect(resourceTags.length).toBe(mockMedia.length);
	});

	it('should pass the correct platform to each resource tag', async () => {
		const view = await render(MediaResourceTagsComponent, {
			imports: [CommonModule, MediaResourceTagComponent],
			inputs: {
				resources: mockMedia,
			},
		});

		const instance = view.fixture.componentInstance;
		const platforms = instance['platforms'] as { [key in MediaTypeKey]: MediaResourcePlatform };

		mockMedia.forEach((media) => {
			const platformIcon = screen.getByLabelText(platforms[media.type].title);
			expect(platformIcon).toBeInTheDocument();
			expect(platformIcon).toHaveAttribute('aria-label', platforms[media.type].title);
			expect(platformIcon).toHaveAttribute('data-testid', expect.stringMatching(/icon-/));
		});
	});

	it('should test all the currently supported platforms', async () => {
		const view = await render(MediaResourceTagsComponent, {
			imports: [CommonModule, MediaResourceTagComponent],
			inputs: {
				resources: mockMedia,
			},
		});
		const instance = view.fixture.componentInstance;
		const platforms = instance['platforms'] as { [key in MediaTypeKey]: MediaResourcePlatform };
		const expectedPlatforms = ['audioRecording', 'spaceRecording', 'spotifyPodcastEpisode', 'youTubeVideo'];
		const actualPlatforms = Object.keys(platforms) as MediaTypeKey[];
		expect(actualPlatforms).toEqual(expectedPlatforms);
		actualPlatforms.forEach((platform) => {
			expect(platforms[platform]).toBeDefined();
			expect(platforms[platform].title).toBeDefined();
			expect(platforms[platform].icon).toBeDefined();
		});
	});
});

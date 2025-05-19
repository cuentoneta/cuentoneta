import { render, screen } from '@testing-library/angular';
import { MediaResourceTagsComponent } from './media-resource-tags.component';
import { MediaResourcePlatform, MediaResourceTagComponent } from '../media-resource-tag/media-resource-tag.component';
import { CommonModule } from '@angular/common';
import { Media, MediaTypeKey } from '@models/media.model';

const mockMedia: Media[] = [
	{
		title: 'Test Media 1',
		description: [],
		type: 'audioRecording',
	},
	{
		title: 'Test Media 2',
		description: [],
		type: 'spaceRecording',
	},
	{
		title: 'Test Media 3',
		description: [],
		type: 'youTubeVideo',
	},
];

describe('MediaResourceTagsComponent', () => {
	it('should render the correct number of resource tags', async () => {
		await render(MediaResourceTagsComponent, {
			imports: [CommonModule, MediaResourceTagComponent],
			inputs: {
				resources: mockMedia,
			},
		});

		const resourceTags = screen.getAllByRole('img'); // Assuming each tag renders an image
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
		const platforms = instance.platforms as { [key in MediaTypeKey]: MediaResourcePlatform };

		mockMedia.forEach((media) => {
			const platformIcon = screen.getByAltText(platforms[media.type].title);
			expect(platformIcon).toBeInTheDocument();
			expect(platformIcon).toHaveAttribute('src', platforms[media.type].icon);
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
		const platforms = instance.platforms as { [key in MediaTypeKey]: MediaResourcePlatform };
		const expectedPlatforms = ['audioRecording', 'spaceRecording', 'youTubeVideo'];
		const actualPlatforms = Object.keys(platforms) as MediaTypeKey[];
		expect(actualPlatforms).toEqual(expectedPlatforms);
		actualPlatforms.forEach((platform) => {
			expect(platforms[platform]).toBeDefined();
			expect(platforms[platform].title).toBeDefined();
			expect(platforms[platform].icon).toBeDefined();
		});
	});
});

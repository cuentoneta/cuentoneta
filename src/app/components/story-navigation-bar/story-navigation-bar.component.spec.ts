import { StoryNavigationBarComponent } from './story-navigation-bar.component';

import { render } from '@testing-library/angular';
import { Observable, of } from 'rxjs';
import { StoryApi } from '../../providers/story.interface';
import { StoryTeaser } from '@models/story.model';
import { StorylistApi } from '../../providers/storylist.interface';
import { Storylist } from '@models/storylist.model';

// Mocks
import { storyMock, storyTeaserMock } from '@mocks/story.mock';
import { storylistMock } from '@mocks/storylist.mock';
import { authorMock } from '@mocks/author.mock';

describe('StoryNavigationBarComponent', () => {
	it('should create for AuthorNavigationFrameComponent', async () => {
		const view = await render(StoryNavigationBarComponent, {
			inputs: {
				selectedStorySlug: storyMock.slug,
				navigation: 'author',
				navigationSlug: authorMock.slug,
			},
			providers: [
				{
					provide: StoryApi,
					useValue: {
						getNavigationTeasersByAuthorSlug(): Observable<StoryTeaser[]> {
							return of([storyTeaserMock]);
						},
					},
				},
			],
		});
		expect(view).toBeTruthy();
	});

	it('should create for StorylistNavigationFrameComponent', async () => {
		const view = await render(StoryNavigationBarComponent, {
			inputs: {
				selectedStorySlug: storyMock.slug,
				navigation: 'storylist',
				navigationSlug: storylistMock.slug,
			},
			providers: [
				{
					provide: StorylistApi,
					useValue: {
						getStorylistNavigationTeasers(): Observable<Storylist> {
							return of(storylistMock);
						},
					},
				},
			],
		});
		expect(view).toBeTruthy();
	});
});

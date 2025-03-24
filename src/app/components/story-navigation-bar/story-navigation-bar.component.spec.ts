import { StoryNavigationBarComponent } from './story-navigation-bar.component';

import { render } from '@testing-library/angular';
import { Observable, of } from 'rxjs';
import { StoryService } from '../../providers/story.service';
import { StoryTeaser } from '@models/story.model';
import { storyMock, storyTeaserMock } from '../../mocks/story.mock';
import { StorylistService } from '../../providers/storylist.service';
import { Storylist } from '@models/storylist.model';
import { storyListMock } from '../../mocks/storylist.mock';
import { authorMock } from '../../mocks/author.mock';

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
					provide: StoryService,
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
				navigationSlug: storyListMock.slug,
			},
			providers: [
				{
					provide: StorylistService,
					useValue: {
						getStorylistNavigationTeasers(): Observable<Storylist> {
							return of(storyListMock);
						},
					},
				},
			],
		});
		expect(view).toBeTruthy();
	});
});

import { CommonModule, DatePipe } from '@angular/common';
import { NEVER, Observable, of } from 'rxjs';

// Components
import { StorylistNavigationFrameComponent } from './storylist-navigation-frame.component';
import { NavigableStorylistStoryTeaserComponent } from '../navigable-storylist-story-teaser/navigable-storylist-story-teaser.component';
import { SkeletonComponent } from '@components/skeleton/skeleton.component';

// Models
import { Storylist } from '@models/storylist.model';

// Mocks
import { storylistMock } from '@mocks/storylist.mock';
import { storyMock } from '@mocks/story.mock';

// Services
import { StorylistApi } from '../../providers/storylist-api.interface';

// 3rd party libs
import { render, screen } from '@testing-library/angular';

// Test utils
import { fn } from '@test-utils';

describe('StorylistNavigationFrameComponent', () => {
	const setup = async () => {
		return await render(StorylistNavigationFrameComponent, {
			componentImports: [CommonModule, NavigableStorylistStoryTeaserComponent, SkeletonComponent],
			inputs: {
				selectedStorySlug: storyMock.slug,
				navigationSlug: storylistMock.slug,
			},
			providers: [
				DatePipe,
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
	};

	test('should render StorylistNavigationFrameComponent', async () => {
		const view = await setup();
		expect(view).toBeTruthy();
	});

	test('should render StorylistNavigationFrameComponent with stories', async () => {
		const view = await setup();
		view.detectChanges();
		expect(screen.getByText(storylistMock.stories[0].title)).toBeInTheDocument();
		expect(screen.getByText(storylistMock.stories[0].author.name)).toBeInTheDocument();
	});

	test('should not fetch navigation teasers when navigationSlug is empty', async () => {
		const getStorylistNavigationTeasers = fn<(slug: string) => Observable<Storylist>>();
		getStorylistNavigationTeasers.mockReturnValue(of(storylistMock));

		const view = await render(StorylistNavigationFrameComponent, {
			componentImports: [CommonModule, NavigableStorylistStoryTeaserComponent, SkeletonComponent],
			inputs: {
				selectedStorySlug: storyMock.slug,
				navigationSlug: '',
			},
			providers: [DatePipe, { provide: StorylistApi, useValue: { getStorylistNavigationTeasers } }],
		});
		view.detectChanges();

		expect(getStorylistNavigationTeasers).not.toHaveBeenCalled();
	});

	test('should render loading skeletons with role="status" while the storylist resolves', async () => {
		await render(StorylistNavigationFrameComponent, {
			componentImports: [CommonModule, NavigableStorylistStoryTeaserComponent, SkeletonComponent],
			inputs: {
				selectedStorySlug: storyMock.slug,
				navigationSlug: storylistMock.slug,
			},
			providers: [
				DatePipe,
				{
					provide: StorylistApi,
					useValue: {
						getStorylistNavigationTeasers(): Observable<Storylist> {
							return NEVER;
						},
					},
				},
			],
		});
		expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
	});
});

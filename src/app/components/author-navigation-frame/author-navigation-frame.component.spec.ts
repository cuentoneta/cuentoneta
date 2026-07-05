import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';

// Components
import { NavigableStoryTeaserComponent } from '../navigable-story-teaser/navigable-story-teaser.component';
import { AuthorNavigationFrameComponent } from './author-navigation-frame.component';

// Models
import { StoryTeaser } from '@models/story.model';

// Mocks
import { storyMock, storyTeaserMock } from '../../mocks/story.mock';

// Services
import { StoryApi } from '../../providers/story-api.interface';
import { NavigationFrameService } from '../../providers/navigation-frame.service';

// 3rd party libs
import { render, screen } from '@testing-library/angular';
import { authorMock } from '../../mocks/author.mock';

// Test utils
import { fn } from '@test-utils';

describe('AuthorNavigationFrameComponent', () => {
	const setup = async () => {
		return await render(AuthorNavigationFrameComponent, {
			componentImports: [CommonModule, NavigableStoryTeaserComponent],
			inputs: {
				selectedStorySlug: storyMock.slug,
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
	};

	test('should render AuthorNavigationFrameComponent', async () => {
		const view = await setup();
		expect(view).toBeTruthy();
	});

	test('should render AuthorNavigationFrameComponent with stories', async () => {
		const view = await setup();
		view.detectChanges();
		expect(screen.getByText(storyTeaserMock.title)).toBeInTheDocument();
		expect(screen.getByText(storyTeaserMock.originalPublication)).toBeInTheDocument();
		expect(screen.getByText(`${storyTeaserMock.approximateReadingTime} minutos de lectura`)).toBeInTheDocument();
	});

	test('should not fetch navigation teasers when navigationSlug is empty', async () => {
		const getNavigationTeasersByAuthorSlug = fn<(slug: string) => Observable<StoryTeaser[]>>();
		getNavigationTeasersByAuthorSlug.mockReturnValue(of([storyTeaserMock]));

		const view = await render(AuthorNavigationFrameComponent, {
			componentImports: [CommonModule, NavigableStoryTeaserComponent],
			inputs: {
				selectedStorySlug: storyMock.slug,
				navigationSlug: '',
			},
			providers: [{ provide: StoryApi, useValue: { getNavigationTeasersByAuthorSlug } }],
		});
		view.detectChanges();

		expect(getNavigationTeasersByAuthorSlug).not.toHaveBeenCalled();
	});

	test('should not publish a navigation config when navigationSlug is empty', async () => {
		const view = await render(AuthorNavigationFrameComponent, {
			componentImports: [CommonModule, NavigableStoryTeaserComponent],
			inputs: {
				selectedStorySlug: storyMock.slug,
				navigationSlug: '',
			},
			providers: [
				{
					provide: StoryApi,
					useValue: {
						getNavigationTeasersByAuthorSlug: () => of([storyTeaserMock]),
					},
				},
			],
		});
		view.detectChanges();

		const navigationFrameService = view.fixture.debugElement.injector.get(NavigationFrameService);
		expect(navigationFrameService.navigationBarConfig().headerTitle).toBe('');
	});

	test('should publish the author navigation config when navigationSlug is present', async () => {
		const view = await setup();
		view.detectChanges();

		const navigationFrameService = view.fixture.debugElement.injector.get(NavigationFrameService);
		expect(navigationFrameService.navigationBarConfig().headerTitle).toBe('Más del autor');
	});
});

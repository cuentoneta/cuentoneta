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
import { StoryService } from '../../providers/story.service';

// 3rd party libs
import { render, screen } from '@testing-library/angular';
import { authorMock } from '../../mocks/author.mock';

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
					provide: StoryService,
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
});

import { AuthorNavigationFrameComponent } from './author-navigation-frame.component';
import { render } from '@testing-library/angular';
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { CommonModule } from '@angular/common';
import { StoryService } from '../../providers/story.service';
import { Observable, of } from 'rxjs';
import { storyTeaserMock } from '../../mocks/story.mock';
import { StoryTeaser } from '@models/story.model';

describe('AuthorNavigationFrameComponent', () => {
	const setup = async () => {
		return await render(AuthorNavigationFrameComponent, {
			componentImports: [CommonModule],
			inputs: {},
			providers: [
				{
					provide: FetchContentDirective,
					useValue: {
						fetchContent$<T>(source$: Observable<T>): Observable<T> {
							return source$;
						},
					},
				},
				{
					provide: StoryService,
					useValue: {
						getByAuthorSlug(slug: string): Observable<StoryTeaser[]> {
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
});

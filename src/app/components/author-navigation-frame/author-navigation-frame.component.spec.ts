import { AuthorNavigationFrameComponent } from './author-navigation-frame.component';
import { render, screen } from '@testing-library/angular';
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { CommonModule } from '@angular/common';
import { StoryService } from '../../providers/story.service';
import { Observable, of } from 'rxjs';
import { storyTeaserMock } from '../../mocks/story.mock';
import { StoryTeaser } from '@models/story.model';
import { RouterTestingModule } from '@angular/router/testing';
import * as ngExtension from 'ngxtension/inject-query-params';
import { signal } from '@angular/core';
import { NavigableStoryTeaserComponent } from '../navigable-story-teaser/navigable-story-teaser.component';

jest.mock('ngxtension/inject-query-params', () => ({
	__esModule: true,
	...jest.requireActual('ngxtension/inject-query-params'),
}));

// Add a jest mock for the injectQueryParams function
jest.spyOn(ngExtension, 'injectQueryParams').mockReturnValue(
	signal({
		navigation: 'author',
		navigationSlug: 'francois-onoff',
	}),
);

describe('AuthorNavigationFrameComponent', () => {
	const setup = async () => {
		return await render(AuthorNavigationFrameComponent, {
			componentImports: [CommonModule, RouterTestingModule, NavigableStoryTeaserComponent],
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

	test('should render AuthorNavigationFrameComponent with stories', async () => {
		const view = await setup();
		view.detectChanges();
		expect(screen.getByText(storyTeaserMock.title)).toBeInTheDocument();
		expect(screen.getByText(storyTeaserMock.originalPublication)).toBeInTheDocument();
		expect(screen.getByText(`${storyTeaserMock.approximateReadingTime} minutos de lectura`)).toBeInTheDocument();
	});
});

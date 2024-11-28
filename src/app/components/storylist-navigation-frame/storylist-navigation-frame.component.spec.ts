import { signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Observable, of } from 'rxjs';

// Components
import { StorylistNavigationFrameComponent } from './storylist-navigation-frame.component';
import { NavigablePublicationTeaserComponent } from '../navigable-publication-teaser/navigable-publication-teaser.component';

// Directives
import { FetchContentDirective } from '../../directives/fetch-content.directive';

// Models
import { Storylist } from '@models/storylist.model';

// Mocks
import { storyListMock } from '../../mocks/story.mock';

// Services
import { StorylistService } from '../../providers/storylist.service';

// 3rd party libs
import * as ngExtension from 'ngxtension/inject-query-params';
import { render, screen } from '@testing-library/angular';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MapPublicationEditionLabelPipe } from '../../pipes/map-publication-edition-label.pipe';

jest.mock('ngxtension/inject-query-params', () => ({
	__esModule: true,
	...jest.requireActual('ngxtension/inject-query-params'),
}));

// Add a jest mock for the injectQueryParams function
jest.spyOn(ngExtension, 'injectQueryParams').mockReturnValue(
	signal({
		navigation: 'storylist',
		navigationSlug: 'verano-2022',
	}),
);

describe('StorylistNavigationFrameComponent', () => {
	const setup = async () => {
		return await render(StorylistNavigationFrameComponent, {
			componentImports: [CommonModule, NavigablePublicationTeaserComponent, NgxSkeletonLoaderModule],
			inputs: {},
			providers: [
				DatePipe,
				MapPublicationEditionLabelPipe,
				{
					provide: FetchContentDirective,
					useValue: {
						fetchContent$<T>(source$: Observable<T>): Observable<T> {
							return source$;
						},
					},
				},
				{
					provide: StorylistService,
					useValue: {
						get(): Observable<Storylist> {
							return of(storyListMock);
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
		expect(screen.getByText(storyListMock.publications[0].story.title)).toBeInTheDocument();
		expect(screen.getByText(storyListMock.publications[0].story.author.name)).toBeInTheDocument();
		expect(screen.getByText('Día 54 - 27 de October, 2024')).toBeInTheDocument();
	});
});

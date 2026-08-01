import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';

import { CollectionReadingSuggestionsComponent } from './collection-reading-suggestions.component';
import { READING_SUGGESTIONS_COUNT } from './pick-reading-suggestions';
import { StorylistApi } from '../../providers/storylist-api.interface';
import type { StorylistStoriesNavigationTeasers } from '@models/storylist.model';
import { storylistNavigationTeaserMock } from '@mocks/storylist.mock';
import { onoffStoryNavigationTeasersWithAuthorMock } from '@mocks/onoff-story-teasers.mock';
import { clearAllMocks, fn, restoreAllMocks, spyOn } from '@test-utils';

const collectionMock: StorylistStoriesNavigationTeasers = {
	...storylistNavigationTeaserMock,
	stories: onoffStoryNavigationTeasersWithAuthorMock,
};

const setup = async (
	getStorylistNavigationTeasers: (slug: string) => Observable<StorylistStoriesNavigationTeasers>,
	inputs: { collectionSlug?: string; currentWorkSlug?: string } = {},
) => {
	const view = await render(CollectionReadingSuggestionsComponent, {
		inputs: {
			collectionSlug: collectionMock.slug,
			...inputs,
		},
		providers: [provideRouter([]), { provide: StorylistApi, useValue: { getStorylistNavigationTeasers } }],
	});
	view.detectChanges();
	return view;
};

describe('CollectionReadingSuggestionsComponent', () => {
	beforeEach(() => {
		clearAllMocks();
		// Azar determinista: el barajado toma siempre el primer candidato disponible, así las
		// aserciones citan las primeras obras del corpus.
		spyOn(Math, 'random').mockReturnValue(0);
	});

	afterEach(() => {
		restoreAllMocks();
	});

	it('should fetch the navigation teasers of the collection', async () => {
		const getStorylistNavigationTeasers = fn<(slug: string) => Observable<StorylistStoriesNavigationTeasers>>();
		getStorylistNavigationTeasers.mockReturnValue(of(collectionMock));

		await setup(getStorylistNavigationTeasers);

		expect(getStorylistNavigationTeasers).toHaveBeenCalledWith(collectionMock.slug);
	});

	it('should not fetch when there is no collection slug', async () => {
		const getStorylistNavigationTeasers = fn<(slug: string) => Observable<StorylistStoriesNavigationTeasers>>();
		getStorylistNavigationTeasers.mockReturnValue(of(collectionMock));

		await setup(getStorylistNavigationTeasers, { collectionSlug: '' });

		expect(getStorylistNavigationTeasers).not.toHaveBeenCalled();
	});

	it('should render the works of the collection as suggestions', async () => {
		await setup(() => of(collectionMock));

		for (const story of collectionMock.stories.slice(0, READING_SUGGESTIONS_COUNT)) {
			expect(screen.getByRole('link', { name: story.title })).toBeInTheDocument();
		}
	});

	it('should suggest as many works as the block renders', async () => {
		await setup(() => of(collectionMock));

		expect(screen.getAllByRole('listitem')).toHaveLength(READING_SUGGESTIONS_COUNT);
	});

	it('should exclude the work being read', async () => {
		const [current] = collectionMock.stories;

		await setup(() => of(collectionMock), { currentWorkSlug: current.slug });

		expect(screen.queryByRole('link', { name: current.title })).not.toBeInTheDocument();
	});

	it('should head the block with the collection title and link to it', async () => {
		await setup(() => of(collectionMock));

		expect(screen.getByRole('heading', { name: `Más obras de ${collectionMock.title}` })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: `Ver más de ${collectionMock.title}` })).toHaveAttribute(
			'href',
			`/storylist/${collectionMock.slug}`,
		);
	});

	it('should show the loading state until the collection arrives', async () => {
		const collection = new Subject<StorylistStoriesNavigationTeasers>();

		const view = await setup(() => collection);

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'true');

		collection.next(collectionMock);
		await view.fixture.whenStable();

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'false');
	});

	it('should stay hidden when the collection has no other work to suggest', async () => {
		const [onlyWork] = collectionMock.stories;

		await setup(() => of({ ...collectionMock, stories: [onlyWork] }), { currentWorkSlug: onlyWork.slug });

		expect(screen.queryByTestId('reading-suggestions')).not.toBeInTheDocument();
	});

	it('should stay hidden when the fetch fails', async () => {
		await setup(() => throwError(() => new Error('la API no responde')));

		expect(screen.queryByTestId('reading-suggestions')).not.toBeInTheDocument();
	});

	it('should carry the collection context into each suggestion link', async () => {
		await setup(() => of(collectionMock));

		const [suggestion] = collectionMock.stories;

		expect(screen.getByRole('link', { name: suggestion.title })).toHaveAttribute(
			'href',
			`/story/${suggestion.slug}?navigation=storylist&navigationSlug=${collectionMock.slug}`,
		);
	});

	it('should show the author of each suggestion, since a collection can gather several', async () => {
		await setup(() => of(collectionMock));

		expect(screen.getAllByTestId('author')).toHaveLength(READING_SUGGESTIONS_COUNT);
	});
});

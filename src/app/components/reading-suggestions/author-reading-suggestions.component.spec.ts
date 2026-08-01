import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';

import { AuthorReadingSuggestionsComponent } from './author-reading-suggestions.component';
import { READING_SUGGESTIONS_COUNT } from './pick-reading-suggestions';
import { StoryApi } from '../../providers/story-api.interface';
import type { StoryNavigationTeaser } from '@models/story.model';
import { onoffStoryNavigationTeasersMock } from '@mocks/onoff-story-teasers.mock';
import { authorTeaserMock } from '@mocks/author.mock';
import { fn, restoreAllMocks, spyOn } from '@test-utils';

const setup = async (
	getNavigationTeasersByAuthorSlug: (slug: string) => Observable<StoryNavigationTeaser[]>,
	inputs: { authorSlug?: string; currentWorkSlug?: string } = {},
) => {
	const view = await render(AuthorReadingSuggestionsComponent, {
		inputs: {
			authorSlug: authorTeaserMock.slug,
			authorName: authorTeaserMock.name,
			...inputs,
		},
		providers: [provideRouter([]), { provide: StoryApi, useValue: { getNavigationTeasersByAuthorSlug } }],
	});
	view.detectChanges();
	return view;
};

describe('AuthorReadingSuggestionsComponent', () => {
	beforeEach(() => {
		// Azar determinista: el barajado toma siempre el primer candidato disponible, así las
		// aserciones citan las primeras obras del corpus.
		spyOn(Math, 'random').mockReturnValue(0);
	});

	afterEach(() => {
		restoreAllMocks();
	});

	it('should fetch the navigation teasers of the author', async () => {
		const getNavigationTeasersByAuthorSlug = fn<(slug: string) => Observable<StoryNavigationTeaser[]>>();
		getNavigationTeasersByAuthorSlug.mockReturnValue(of(onoffStoryNavigationTeasersMock));

		await setup(getNavigationTeasersByAuthorSlug);

		expect(getNavigationTeasersByAuthorSlug).toHaveBeenCalledWith(authorTeaserMock.slug);
	});

	it('should not fetch when there is no author slug', async () => {
		const getNavigationTeasersByAuthorSlug = fn<(slug: string) => Observable<StoryNavigationTeaser[]>>();
		getNavigationTeasersByAuthorSlug.mockReturnValue(of(onoffStoryNavigationTeasersMock));

		await setup(getNavigationTeasersByAuthorSlug, { authorSlug: '' });

		expect(getNavigationTeasersByAuthorSlug).not.toHaveBeenCalled();
	});

	it('should render the fetched works as suggestions', async () => {
		await setup(() => of(onoffStoryNavigationTeasersMock));

		for (const story of onoffStoryNavigationTeasersMock.slice(0, READING_SUGGESTIONS_COUNT)) {
			expect(screen.getByRole('link', { name: story.title })).toBeInTheDocument();
		}
	});

	it('should suggest as many works as the block renders', async () => {
		await setup(() => of(onoffStoryNavigationTeasersMock));

		expect(screen.getAllByRole('listitem')).toHaveLength(READING_SUGGESTIONS_COUNT);
	});

	it('should exclude the work being read', async () => {
		const [current] = onoffStoryNavigationTeasersMock;

		await setup(() => of(onoffStoryNavigationTeasersMock), { currentWorkSlug: current.slug });

		expect(screen.queryByRole('link', { name: current.title })).not.toBeInTheDocument();
	});

	it('should head the block with the author name and link to their listing', async () => {
		await setup(() => of(onoffStoryNavigationTeasersMock));

		expect(screen.getByRole('heading', { name: `Más obras de ${authorTeaserMock.name}` })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: `Ver más de ${authorTeaserMock.name}` })).toHaveAttribute(
			'href',
			`/author/${authorTeaserMock.slug}`,
		);
	});

	it('should show the loading state until the works arrive', async () => {
		const stories = new Subject<StoryNavigationTeaser[]>();

		const view = await setup(() => stories);

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'true');

		stories.next(onoffStoryNavigationTeasersMock);
		await view.fixture.whenStable();

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'false');
	});

	it('should hide the author of each suggestion, already named in the heading', async () => {
		await setup(() => of(onoffStoryNavigationTeasersMock));

		expect(screen.queryAllByTestId('author')).toHaveLength(0);
	});
});

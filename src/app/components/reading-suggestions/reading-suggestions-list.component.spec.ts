import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { clearAllMocks } from '@test-utils';

import { ReadingSuggestionsListComponent } from './reading-suggestions-list.component';
import { READING_SUGGESTIONS_COUNT } from './pick-reading-suggestions';
import type { ReadingSuggestion } from './story-teaser-to-reading-suggestion.adapter';
import type { NavigationParams } from '@app-utils/navigation-params';
import {
	onoffLiteraryWorkTeasersMock,
	onoffLiteraryWorkTeasersWithMediaSourcesMock,
} from '@mocks/onoff-literary-work-teasers.mock';

// El bloque recibe la obra y su extracto por separado. Acá el extracto va vacío: la rama de Portable
// Text la ejercitan los specs de los wrappers conectados, que son los que producen ese dato.
const toSuggestion = (literaryWork: (typeof onoffLiteraryWorkTeasersMock)[number]): ReadingSuggestion => ({
	literaryWork,
	excerptParagraphs: [],
});

const teasers = onoffLiteraryWorkTeasersMock.slice(0, 3).map(toSuggestion);

type ReadingSuggestionsInputs = Partial<{
	heading: string;
	teasers: readonly ReadingSuggestion[];
	loading: boolean;
	moreLabel: string;
	moreRoute: string | readonly string[] | undefined;
	navigationParams: NavigationParams;
	showAuthor: boolean;
}>;

const setup = (inputs: ReadingSuggestionsInputs = {}) =>
	render(ReadingSuggestionsListComponent, {
		inputs: {
			heading: 'Más obras de François Onoff',
			teasers,
			moreLabel: 'Ver más de François Onoff',
			moreRoute: ['/', 'author', 'francois-onoff'],
			...inputs,
		},
		providers: [provideRouter([])],
	});

describe('ReadingSuggestionsListComponent', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	describe('separación entre sugerencias', () => {
		// El separador va entre sugerencias, así que son siempre uno menos que las obras. Cubre a la vez
		// el intercalado y que no quede uno colgando al final.
		it.each([1, 2, 3, 5])('should draw one separator less than the %i suggestions', async (count) => {
			await setup({ teasers: onoffLiteraryWorkTeasersMock.slice(0, count).map(toSuggestion) });

			expect(screen.queryAllByTestId('suggestion-separator')).toHaveLength(count - 1);
		});

		// La invariante que justifica que el divisor sea decorativo: la lista ya delimita sus ítems, y
		// anunciar además cada línea como separador repetiría esa información.
		it('should not expose the separators to assistive technology', async () => {
			await setup();

			expect(screen.queryAllByRole('separator')).toHaveLength(0);
		});

		// El estado de carga ocupa los mismos slots, así que la separación tiene que acompañarlo o el
		// layout salta al llegar las obras.
		it('should separate the loading placeholders the same way', async () => {
			await setup({ loading: true });

			expect(screen.queryAllByTestId('suggestion-separator')).toHaveLength(READING_SUGGESTIONS_COUNT - 1);
		});
	});

	it('should render the heading', async () => {
		await setup();

		expect(screen.getByRole('heading', { name: 'Más obras de François Onoff' })).toBeInTheDocument();
	});

	it('should render one card per suggestion', async () => {
		await setup();

		for (const { literaryWork } of teasers) {
			expect(screen.getByRole('link', { name: literaryWork.title })).toBeInTheDocument();
		}
	});

	it('should render the link to the full listing', async () => {
		await setup();

		const link = screen.getByRole('link', { name: 'Ver más de François Onoff' });

		expect(link).toHaveAttribute('href', '/author/francois-onoff');
	});

	it('should omit the listing link when there is no route', async () => {
		await setup({ moreRoute: undefined });

		expect(screen.queryByRole('link', { name: 'Ver más de François Onoff' })).not.toBeInTheDocument();
	});

	it('should not render the block at all when there are no suggestions', async () => {
		await setup({ teasers: [] });

		expect(screen.queryByTestId('reading-suggestions')).not.toBeInTheDocument();
		expect(screen.queryByRole('heading')).not.toBeInTheDocument();
		expect(screen.queryByRole('link', { name: 'Ver más de François Onoff' })).not.toBeInTheDocument();
	});

	it('should swap the suggestions for card skeletons while loading', async () => {
		await setup({ loading: true });

		expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
		expect(screen.queryByRole('link', { name: teasers[0].literaryWork.title })).not.toBeInTheDocument();
	});

	it('should hide the heading and the listing link while loading', async () => {
		await setup({ loading: true });

		expect(screen.queryByRole('heading')).not.toBeInTheDocument();
		expect(screen.queryByRole('link')).not.toBeInTheDocument();
	});

	it('should flag the block as busy while loading', async () => {
		await setup({ loading: true });

		expect(screen.getByTestId('reading-suggestions')).toHaveAttribute('aria-busy', 'true');
	});

	it('should show the author of each suggestion only when asked to', async () => {
		await setup({ showAuthor: true });

		expect(screen.getAllByTestId('author').length).toBe(teasers.length);
	});

	it('should hide the author of each suggestion by default', async () => {
		await setup();

		expect(screen.queryAllByTestId('author')).toHaveLength(0);
	});

	it('should show the excerpt of each suggestion', async () => {
		await setup();

		expect(screen.getAllByTestId('description')).toHaveLength(teasers.length);
	});

	// Sin el autor, la tarjeta libera esa franja vertical y el extracto gana una línea.
	it('should give the excerpt an extra line when the author is not shown', async () => {
		await setup({ showAuthor: false });

		for (const excerpt of screen.getAllByTestId('description')) {
			expect(excerpt).toHaveClass('line-clamp-3');
		}
	});

	it('should keep the excerpt at two lines when the author takes its space', async () => {
		await setup({ showAuthor: true });

		for (const excerpt of screen.getAllByTestId('description')) {
			expect(excerpt).toHaveClass('line-clamp-2');
		}
	});

	it('should label each suggestion with the literary type its corpus entry carries', async () => {
		await setup();

		for (const { literaryWork } of teasers) {
			expect(screen.getAllByText(literaryWork.tags[0].title).length).toBeGreaterThan(0);
		}
	});

	it('should expose the multimedia of each suggestion', async () => {
		await setup({ teasers: onoffLiteraryWorkTeasersWithMediaSourcesMock.slice(0, 3).map(toSuggestion) });

		expect(screen.getAllByTestId('media')).toHaveLength(3);
	});
});

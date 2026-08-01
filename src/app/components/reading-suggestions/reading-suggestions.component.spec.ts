import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { clearAllMocks } from '@test-utils';

import { ReadingSuggestionsComponent } from './reading-suggestions.component';
import type { LiteraryWorkCardTeaserContent } from '@components/literary-work-card-teaser/literary-work-card-teaser.component';
import {
	onoffLiteraryWorkTeasersMock,
	onoffLiteraryWorkTeasersWithMediaSourcesMock,
} from '@mocks/onoff-literary-work-teasers.mock';

const teasers = onoffLiteraryWorkTeasersMock.slice(0, 3);

type ReadingSuggestionsInputs = Partial<{
	heading: string;
	teasers: readonly LiteraryWorkCardTeaserContent[];
	loading: boolean;
	moreLabel: string;
	moreRoute: string | readonly string[] | undefined;
	showAuthor: boolean;
	tagLabel: string;
}>;

const setup = (inputs: ReadingSuggestionsInputs = {}) =>
	render(ReadingSuggestionsComponent, {
		inputs: {
			heading: 'Más obras de François Onoff',
			teasers,
			moreLabel: 'Ver más de François Onoff',
			moreRoute: ['/', 'author', 'francois-onoff'],
			...inputs,
		},
		providers: [provideRouter([])],
	});

describe('ReadingSuggestionsComponent', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	it('should render the heading', async () => {
		await setup();

		expect(screen.getByRole('heading', { name: 'Más obras de François Onoff' })).toBeInTheDocument();
	});

	it('should render one card per suggestion', async () => {
		await setup();

		for (const teaser of teasers) {
			expect(screen.getByRole('link', { name: teaser.title })).toBeInTheDocument();
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
		expect(screen.queryByRole('link', { name: teasers[0].title })).not.toBeInTheDocument();
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

	it('should expose the multimedia of each suggestion', async () => {
		await setup({ teasers: onoffLiteraryWorkTeasersWithMediaSourcesMock.slice(0, 3) });

		expect(screen.getAllByTestId('media')).toHaveLength(3);
	});
});

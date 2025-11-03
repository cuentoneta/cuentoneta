import { LatestStoriesCardDeck } from './latest-stories-card-deck';
import { render, screen } from '@testing-library/angular';
import { storyNavigationTeaserWithAuthorMock } from '@mocks/story.mock';
import { DeferBlockState } from '@angular/core/testing';

describe('LatestStoriesCardDeck', () => {
	it('should render the component', async () => {
		const { container } = await render(LatestStoriesCardDeck, {
			inputs: {
				stories: [storyNavigationTeaserWithAuthorMock],
			},
		});
		expect(container).toBeTruthy();
	});

	it('should render skeletons and then the cards', async () => {
		const { fixture } = await render(LatestStoriesCardDeck, {
			inputs: {
				stories: [
					storyNavigationTeaserWithAuthorMock,
					{ ...storyNavigationTeaserWithAuthorMock, title: 'Las arenas de la eternidad' },
					{ ...storyNavigationTeaserWithAuthorMock, title: 'El instante antes del fin' },
					{ ...storyNavigationTeaserWithAuthorMock, title: '3010: La frontera final' },
					{ ...storyNavigationTeaserWithAuthorMock, title: 'La carta perdida de Lucy Westenra' },
					{ ...storyNavigationTeaserWithAuthorMock, title: 'Rocky VII: La venganza de Adrian' },
				],
			},
		});
		const deferBlockFixture = (await fixture.getDeferBlocks())[0];

		await deferBlockFixture.render(DeferBlockState.Loading);
		const skeletons = screen.getAllByTestId('skeleton');
		expect(skeletons.length).toEqual(6);

		await deferBlockFixture.render(DeferBlockState.Complete);
		const card1Title = screen.getByText(storyNavigationTeaserWithAuthorMock.title);
		const card2Title = screen.getByText('Las arenas de la eternidad');
		const card3Title = screen.getByText('El instante antes del fin');
		expect(card1Title).toBeInTheDocument();
		expect(card2Title).toBeInTheDocument();
		expect(card3Title).toBeInTheDocument();

		const cards = screen.getAllByTestId('card');
		expect(cards.length).toEqual(6);
	});
});

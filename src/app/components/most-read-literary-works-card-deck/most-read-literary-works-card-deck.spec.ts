import { MostReadLiteraryWorksCardDeck } from './most-read-literary-works-card-deck';
import { render, screen } from '@testing-library/angular';
import { onoffLiteraryWorkNavigationTeasersWithAuthorsMock } from '@mocks/onoff-literary-work-teasers.mock';
import { DeferBlockState } from '@angular/core/testing';

const literaryWorks = onoffLiteraryWorkNavigationTeasersWithAuthorsMock.slice(0, 3);

describe('MostReadLiteraryWorksCardDeck', () => {
	it('should render the component', async () => {
		const { container } = await render(MostReadLiteraryWorksCardDeck, {
			inputs: { literaryWorks: literaryWorks.slice(0, 1) },
		});
		expect(container).toBeTruthy();
	});

	it('should render skeletons and then the cards', async () => {
		const { fixture } = await render(MostReadLiteraryWorksCardDeck, { inputs: { literaryWorks } });
		const deferBlockFixture = (await fixture.getDeferBlocks())[0];

		await deferBlockFixture.render(DeferBlockState.Loading);
		expect(screen.getAllByTestId('skeleton')).toHaveLength(6);

		await deferBlockFixture.render(DeferBlockState.Complete);
		literaryWorks.forEach(({ title }) => {
			expect(screen.getByText(title)).toBeInTheDocument();
		});
		expect(screen.getAllByTestId('card')).toHaveLength(literaryWorks.length);
	});

	it('links every card to the reading route', async () => {
		const { fixture } = await render(MostReadLiteraryWorksCardDeck, { inputs: { literaryWorks } });
		const deferBlockFixture = (await fixture.getDeferBlocks())[0];

		await deferBlockFixture.render(DeferBlockState.Complete);

		const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
		literaryWorks.forEach(({ slug }) => {
			expect(hrefs.some((href) => href?.startsWith(`/read/${slug}`))).toBe(true);
		});
	});
});

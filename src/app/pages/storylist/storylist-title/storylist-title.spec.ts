import { render, screen } from '@testing-library/angular';
import { DeferBlockState } from '@angular/core/testing';

import { StorylistTitle } from './storylist-title';
import { storylistMock } from '@mocks/storylist.mock';

describe('StorylistTitle', () => {
	it('should render the storylist title as the level-1 heading', async () => {
		const { fixture } = await render(StorylistTitle, { inputs: { storylist: storylistMock } });
		const deferBlock = (await fixture.getDeferBlocks())[0];
		await deferBlock.render(DeferBlockState.Complete);

		expect(screen.getByRole('heading', { level: 1, name: storylistMock.title })).toBeInTheDocument();
	});

	it('should render a tag for each storylist tag', async () => {
		const { fixture } = await render(StorylistTitle, { inputs: { storylist: storylistMock } });
		const deferBlock = (await fixture.getDeferBlocks())[0];
		await deferBlock.render(DeferBlockState.Complete);

		for (const tag of storylistMock.tags) {
			// La clase `uppercase` confirma que el tag se renderiza con la variante `filled`.
			expect(screen.getByText(tag.title)).toHaveClass('uppercase');
		}
	});

	it('should render the stories count', async () => {
		const { fixture } = await render(StorylistTitle, { inputs: { storylist: storylistMock } });
		const deferBlock = (await fixture.getDeferBlocks())[0];
		await deferBlock.render(DeferBlockState.Complete);

		expect(screen.getByText(`${storylistMock.count} textos`)).toBeInTheDocument();
	});
});

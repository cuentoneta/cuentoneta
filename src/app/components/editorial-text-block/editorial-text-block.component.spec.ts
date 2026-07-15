import { render, screen } from '@testing-library/angular';

import { EditorialTextBlockComponent } from './editorial-text-block.component';
import { Epigraph } from '@models/story.model';
import { epigraphMock } from '@mocks/epigraph-mock';

const epigraphWithoutReference: Epigraph = { ...epigraphMock, reference: [] };

describe('EditorialTextBlockComponent', () => {
	it('should render the editorial text content', async () => {
		await render(EditorialTextBlockComponent, { inputs: { content: epigraphMock } });

		expect(
			screen.getByText('El pasado es un espejo roto; cada fragmento refleja una verdad diferente.'),
		).toBeInTheDocument();
	});

	it('should render the right-aligned reference when a reference is present', async () => {
		const { container } = await render(EditorialTextBlockComponent, { inputs: { content: epigraphMock } });

		expect(screen.getByText('El libro de las maravillas de antaño y de hace poco')).toBeInTheDocument();
		expect(container.querySelector('.text-end')).toBeInTheDocument();
	});

	it('should not render the reference block when the reference is empty', async () => {
		const { container } = await render(EditorialTextBlockComponent, {
			inputs: { content: epigraphWithoutReference },
		});

		expect(container.querySelector('.text-end')).not.toBeInTheDocument();
	});

	it('should apply the note variant chrome by default', async () => {
		const { container } = await render(EditorialTextBlockComponent, { inputs: { content: epigraphMock } });
		const host = container.firstElementChild;

		expect(host).toHaveClass('bg-neutral-50', 'border-neutral-150', 'rounded-xl');
		expect(host).not.toHaveClass('bg-brand-50');
	});

	it('should apply the highlight variant chrome and render the brand accent bar', async () => {
		const { container } = await render(EditorialTextBlockComponent, {
			inputs: { content: epigraphMock, variant: 'highlight' },
		});
		const host = container.firstElementChild;

		expect(host).toHaveClass('bg-brand-50', 'rounded-lg');
		expect(container.querySelector('.bg-brand-400')).toBeInTheDocument();
	});
});

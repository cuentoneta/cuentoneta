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

	it('should render the reference right-aligned when a reference is present', async () => {
		await render(EditorialTextBlockComponent, { inputs: { content: epigraphMock } });

		expect(screen.getByText('El libro de las maravillas de antaño y de hace poco')).toBeInTheDocument();
		expect(screen.getByTestId('reference')).toHaveClass('text-end');
	});

	it('should not render the reference block when the reference is empty', async () => {
		await render(EditorialTextBlockComponent, { inputs: { content: epigraphWithoutReference } });

		expect(screen.queryByTestId('reference')).not.toBeInTheDocument();
	});

	it('should apply the note variant chrome by default and omit the accent bar', async () => {
		await render(EditorialTextBlockComponent, { inputs: { content: epigraphMock } });

		expect(screen.getByTestId('editorial-text-block')).toHaveClass('bg-neutral-50', 'border-neutral-150', 'rounded-xl');
		expect(screen.queryByTestId('accent-bar')).not.toBeInTheDocument();
	});

	it('should apply the highlight variant chrome and render the brand accent bar', async () => {
		await render(EditorialTextBlockComponent, { inputs: { content: epigraphMock, variant: 'highlight' } });

		expect(screen.getByTestId('editorial-text-block')).toHaveClass('bg-brand-50', 'rounded-lg');
		expect(screen.getByTestId('accent-bar')).toHaveClass('bg-brand-400');
	});
});

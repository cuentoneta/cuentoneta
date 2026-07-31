import { render, screen } from '@testing-library/angular';

import { EditorialNoteComponent } from './editorial-note.component';
import { elOdioEpigraphMock } from '@mocks/onoff/el-odio.mock';

const content = elOdioEpigraphMock.text;
const reference = elOdioEpigraphMock.reference;

describe('EditorialNoteComponent', () => {
	it('should render the sanitized html content', async () => {
		await render(EditorialNoteComponent, { inputs: { content } });

		expect(screen.getByText('El odio se hereda como un apellido.')).toBeInTheDocument();
	});

	it('should interpret the markup instead of escaping it', async () => {
		await render(EditorialNoteComponent, { inputs: { content } });

		expect(screen.getByText('El odio se hereda como un apellido.').tagName).toBe('EM');
	});

	it('should render the reference as a right-aligned italic caption citing its source', async () => {
		await render(EditorialNoteComponent, { inputs: { content, reference } });

		expect(screen.getByText('François Onoff, cuaderno de 1969')).toBeInTheDocument();
		expect(screen.getByTestId('reference').tagName).toBe('FIGCAPTION');
		expect(screen.getByTestId('reference-source').tagName).toBe('CITE');
		expect(screen.getByTestId('reference')).toHaveClass('text-end', 'italic');
	});

	it('should not render the reference block when no reference is provided', async () => {
		await render(EditorialNoteComponent, { inputs: { content } });

		expect(screen.queryByTestId('reference')).not.toBeInTheDocument();
	});

	it('should apply the note variant chrome by default and omit the accent bar', async () => {
		await render(EditorialNoteComponent, { inputs: { content } });

		expect(screen.getByTestId('editorial-note')).toHaveClass('bg-neutral-50', 'border-neutral-150', 'rounded-xl');
		expect(screen.getByTestId('body')).toHaveClass('source-serif-lg', 'text-neutral-800');
		expect(screen.queryByTestId('accent-bar')).not.toBeInTheDocument();
	});

	it('should apply the highlight variant chrome and render the brand accent bar', async () => {
		await render(EditorialNoteComponent, { inputs: { content, variant: 'highlight' } });

		expect(screen.getByTestId('editorial-note')).toHaveClass('bg-brand-50', 'rounded-lg');
		expect(screen.getByTestId('body')).toHaveClass('source-serif-lg', 'text-neutral-700');
		expect(screen.getByTestId('accent-bar')).toHaveClass('bg-brand-400');
	});

	// La semántica es parte del contrato, no un detalle de estilo: highlight cita a un tercero y note
	// comenta la obra desde afuera. La figura es la que empareja el contenido con su referencia.
	it('should render the highlight variant as a blockquote inside the figure', async () => {
		await render(EditorialNoteComponent, { inputs: { content, variant: 'highlight' } });

		expect(screen.getByTestId('body').tagName).toBe('FIGURE');
		expect(screen.getByTestId('content').tagName).toBe('BLOCKQUOTE');
	});

	it('should render the note variant as an aside inside the figure', async () => {
		await render(EditorialNoteComponent, { inputs: { content } });

		expect(screen.getByTestId('body').tagName).toBe('FIGURE');
		expect(screen.getByTestId('content').tagName).toBe('ASIDE');
	});
});

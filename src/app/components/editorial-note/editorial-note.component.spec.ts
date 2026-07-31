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

	it('should render the reference right-aligned and italic when a reference is present', async () => {
		await render(EditorialNoteComponent, { inputs: { content, reference } });

		expect(screen.getByText('François Onoff, cuaderno de 1969')).toBeInTheDocument();
		expect(screen.getByTestId('reference')).toHaveClass('text-end', 'italic');
	});

	it('should not render the reference block when no reference is provided', async () => {
		await render(EditorialNoteComponent, { inputs: { content } });

		expect(screen.queryByTestId('reference')).not.toBeInTheDocument();
	});

	it('should apply the note variant chrome by default and omit the accent bar', async () => {
		await render(EditorialNoteComponent, { inputs: { content } });

		expect(screen.getByTestId('editorial-note')).toHaveClass('bg-neutral-50', 'border-neutral-150', 'rounded-xl');
		expect(screen.queryByTestId('accent-bar')).not.toBeInTheDocument();
	});

	it('should apply the highlight variant chrome and render the brand accent bar', async () => {
		await render(EditorialNoteComponent, { inputs: { content, variant: 'highlight' } });

		expect(screen.getByTestId('editorial-note')).toHaveClass('bg-brand-50', 'rounded-lg');
		expect(screen.getByTestId('accent-bar')).toHaveClass('bg-brand-400');
	});
});

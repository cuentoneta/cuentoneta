import { render, screen } from '@testing-library/angular';

import { EditorialNoteComponent } from './editorial-note.component';
import { onoffLiteraryWorkEpigraphsMock } from '@mocks/onoff-literary-works.mock';
import { createAttributedText } from '@models/attributed-text.model';

// Un texto atribuido cualquiera del canon y su versión sin atribución: los casos que no dependen del
// contenido toman este par en vez de una obra concreta.
const [noteWithReference] = onoffLiteraryWorkEpigraphsMock;
const note = createAttributedText({ text: noteWithReference.text });

// La prosa se deriva del propio fixture, para que las aserciones no queden atadas a una obra puntual.
function firstWordOf(html: string): string {
	const [word] = html.replace(/<[^>]+>/g, ' ').match(/\p{L}{6,}/gu) ?? [];
	if (word === undefined) {
		throw new Error(`El texto del canon no tiene palabras suficientes: "${html}"`);
	}
	return word;
}

describe('EditorialNoteComponent', () => {
	it('should render the sanitized html content', async () => {
		await render(EditorialNoteComponent, { inputs: { note } });

		expect(screen.getAllByText(new RegExp(firstWordOf(note.text), 'i')).length).toBeGreaterThan(0);
	});

	it('should interpret the markup instead of escaping it', async () => {
		await render(EditorialNoteComponent, { inputs: { note } });

		// Si el markup se escapara, el texto viviría en el contenedor y no dentro de la etiqueta que lo
		// envuelve en el canon: la diferencia entre pintar HTML e imprimirlo como texto.
		expect(screen.getByText(new RegExp(firstWordOf(note.text), 'i')).tagName).not.toBe('DIV');
	});

	it('should render the reference as a right-aligned italic caption citing its source', async () => {
		await render(EditorialNoteComponent, { inputs: { note: noteWithReference } });

		expect(screen.getByTestId('reference').tagName).toBe('FIGCAPTION');
		expect(screen.getByTestId('reference-source').tagName).toBe('CITE');
		expect(screen.getByTestId('reference')).toHaveClass('text-end', 'italic');
	});

	// Recorre el canon en vez de una obra concreta: cualquier epígrafe del corpus tiene que caber en
	// el componente, y el caso crece solo cuando se enriquece otra obra.
	it.each(onoffLiteraryWorkEpigraphsMock)('should pair any canonical epigraph with its source', async (epigraph) => {
		await render(EditorialNoteComponent, { inputs: { note: epigraph, variant: 'highlight' } });

		expect(screen.getByTestId('content').tagName).toBe('BLOCKQUOTE');
		expect(screen.getByTestId('reference-source').tagName).toBe('CITE');
	});

	it('should not render the reference block when no reference is provided', async () => {
		await render(EditorialNoteComponent, { inputs: { note } });

		expect(screen.queryByTestId('reference')).not.toBeInTheDocument();
	});

	it('should apply the note variant chrome by default and omit the accent bar', async () => {
		await render(EditorialNoteComponent, { inputs: { note } });

		expect(screen.getByTestId('editorial-note')).toHaveClass('bg-neutral-50', 'border-neutral-150', 'rounded-xl');
		expect(screen.getByTestId('body')).toHaveClass('source-serif-lg', 'text-neutral-800');
		expect(screen.queryByTestId('accent-bar')).not.toBeInTheDocument();
	});

	it('should apply the highlight variant chrome and render the brand accent bar', async () => {
		await render(EditorialNoteComponent, { inputs: { note, variant: 'highlight' } });

		expect(screen.getByTestId('editorial-note')).toHaveClass('bg-brand-50', 'rounded-lg');
		expect(screen.getByTestId('body')).toHaveClass('source-serif-lg', 'text-neutral-700');
		expect(screen.getByTestId('accent-bar')).toHaveClass('bg-brand-400');
	});

	// La semántica es parte del contrato, no un detalle de estilo: highlight cita a un tercero y note
	// comenta la obra desde afuera. La figura es la que empareja el contenido con su referencia.
	it('should render the highlight variant as a blockquote inside the figure', async () => {
		await render(EditorialNoteComponent, { inputs: { note, variant: 'highlight' } });

		expect(screen.getByTestId('body').tagName).toBe('FIGURE');
		expect(screen.getByTestId('content').tagName).toBe('BLOCKQUOTE');
	});

	it('should render the note variant as an aside inside the figure', async () => {
		await render(EditorialNoteComponent, { inputs: { note } });

		expect(screen.getByTestId('body').tagName).toBe('FIGURE');
		expect(screen.getByTestId('content').tagName).toBe('ASIDE');
	});

	// Un `<aside>` anidado en contenido seccionador solo es región navegable si tiene nombre: el rótulo
	// es lo que separa la voz del editor de la del texto que comenta, para quien no ve la tarjeta.
	it('should expose the note as a named landmark when a label is provided', async () => {
		await render(EditorialNoteComponent, { inputs: { note, label: 'Nota editorial' } });

		expect(screen.getByRole('complementary', { name: 'Nota editorial' })).toBeInTheDocument();
	});

	// La cita no es una región y su valor es su propio texto: nombrarla hace que algunas ayudas técnicas
	// anuncien el rótulo en lugar de lo citado.
	it('should not name the quote in the highlight variant', async () => {
		await render(EditorialNoteComponent, { inputs: { note, variant: 'highlight', label: 'Nota editorial' } });

		expect(screen.getByTestId('content')).not.toHaveAttribute('aria-label');
	});

	it('should not name the block when no label is provided', async () => {
		await render(EditorialNoteComponent, { inputs: { note } });

		expect(screen.getByTestId('content')).not.toHaveAttribute('aria-label');
	});
});

import { render, screen } from '@testing-library/angular';

import { LiteraryWorkSectionBodyComponent } from './literary-work-section-body.component';
import { onoffLiteraryWorksMock, onoffLiteraryWorksWithBlockquotes } from '@mocks/onoff-literary-works.mock';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

const [anyLiteraryWork] = onoffLiteraryWorksMock;
const [literaryWorkWithQuote] = onoffLiteraryWorksWithBlockquotes;

async function setup(body = anyLiteraryWork.content[0].bodyHtml) {
	return render(LiteraryWorkSectionBodyComponent, { inputs: { body } });
}

describe('LiteraryWorkSectionBodyComponent', () => {
	it('pinta el cuerpo como marcado y no como texto', async () => {
		await setup();

		// El cuerpo del canon es HTML: si se interpolara en vez de bindearse, el marcado llegaría como
		// texto y no habría un solo párrafo en el árbol de accesibilidad.
		expect(screen.getAllByRole('paragraph').length).toBeGreaterThan(0);
		expect(screen.getByTestId('literary-work-section-body').textContent).not.toContain('<p>');
	});

	// La cita es el motivo de este componente: es lo que el original marcaba con alineación y lo que
	// las reglas tipográficas tienen que distinguir del párrafo.
	it('conserva la cita que el cuerpo del canon transcribe', async () => {
		await setup(literaryWorkWithQuote.content[0].bodyHtml);

		expect(screen.getByRole('blockquote')).toBeTruthy();
	});

	// Es la razón por la que el bypass existe. Se afirma sobre los hints de carga y no sobre `srcset`:
	// medido, el saneador de Angular deja pasar `srcset` y borra `loading`/`decoding`, así que una
	// aserción sobre el primero pasaría igual sin bypass y no verificaría nada.
	it('conserva los hints de carga que el pipeline inyecta en una imagen', async () => {
		const body = markdownToSanitizedHtml(
			createMarkdown('![Retrato](https://cdn.sanity.io/images/x/y/abc-800x600.jpg)'),
		);

		await setup(body);

		const image = screen.getByAltText('Retrato');
		expect(image.getAttribute('loading')).toBe('lazy');
		expect(image.getAttribute('decoding')).toBe('async');
	});
});

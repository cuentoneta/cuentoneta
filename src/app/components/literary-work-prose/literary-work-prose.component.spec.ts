import { render, screen } from '@testing-library/angular';

import { LiteraryWorkProseComponent } from './literary-work-prose.component';
import { onoffLiteraryWorksMock, onoffLiteraryWorksWithBlockquotes } from '@mocks/onoff-literary-works.mock';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

const [anyWork] = onoffLiteraryWorksMock;
const [workWithQuote] = onoffLiteraryWorksWithBlockquotes;

async function setup(body = anyWork.content[0].bodyHtml) {
	return render(LiteraryWorkProseComponent, { inputs: { body } });
}

describe('LiteraryWorkProseComponent', () => {
	it('pinta el cuerpo como marcado y no como texto', async () => {
		const { container } = await setup();

		// El cuerpo del canon es HTML: si se interpolara en vez de bindearse, el marcado llegaría como
		// texto y no habría un solo elemento de párrafo. No se expresa por rol: un <p> no tiene rol.
		/* eslint-disable testing-library/no-container, testing-library/no-node-access -- la ausencia de un tag no se expresa por rol ni por texto */
		expect(container.querySelectorAll('p').length).toBeGreaterThan(0);
		/* eslint-enable testing-library/no-container, testing-library/no-node-access */
		expect(screen.getByTestId('literary-work-prose').textContent).not.toContain('<p>');
	});

	// La cita es el motivo de este componente: es lo que el original marcaba con alineación y lo que
	// las reglas tipográficas tienen que distinguir del párrafo.
	it('conserva la cita que el cuerpo del canon transcribe', async () => {
		const { container } = await setup(workWithQuote.content[0].bodyHtml);

		/* eslint-disable testing-library/no-container, testing-library/no-node-access -- la presencia de un tag no se expresa por rol ni por texto */
		expect(container.querySelector('blockquote')).not.toBeNull();
		/* eslint-enable testing-library/no-container, testing-library/no-node-access */
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

import type { Meta, StoryObj } from '@storybook/angular-vite';
import { argsToTemplate } from '@storybook/angular-vite';

import { LiteraryWorkSectionBodyComponent } from './literary-work-section-body.component';
import { onoffLiteraryWorksMock, onoffLiteraryWorksWithBlockquotes } from '@mocks/onoff-literary-works.mock';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

const [{ content: plainContent }] = onoffLiteraryWorksMock;
const [{ content: contentWithQuote }] = onoffLiteraryWorksWithBlockquotes;

// El canon solo ejercita párrafos y una cita: el resto de lo que el saneamiento permite se arma
// corriendo el pipeline real sobre este markdown, así el HTML de la story sale de la misma cadena que
// el de producción y no de marcado clavado a mano.
const PIPELINE_COVERAGE_MARKDOWN = [
	'## Un encabezado abre una parte',
	'',
	'Un párrafo con _énfasis_, **negrita** y un [enlace a la obra](https://cuentoneta.ar).',
	'',
	'> Una cita que el relato transcribe,',
	'> con su segundo bloque.',
	'',
	'- Primer ítem de una lista',
	'- Segundo ítem de una lista',
	'',
	'1. Primer paso enumerado',
	'2. Segundo paso enumerado',
	'',
	'---',
	'',
	'### Un encabezado menor',
	'',
	'Dos versos que cortan la línea sin cerrar el párrafo,',
	'para ver el interlineado del verso con la tipografía del contenedor.',
	'',
	'![Retrato del autor](https://cdn.sanity.io/images/x/y/abc-800x600.jpg)',
	'',
	'El párrafo que cierra la cobertura.',
].join('\n');

const meta: Meta<LiteraryWorkSectionBodyComponent> = {
	component: LiteraryWorkSectionBodyComponent,
	title: 'Componentes V3/LiteraryWorkSectionBody',
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Cuerpo de una sección de obra (<strong>LiteraryWork</strong>) del Design System v3, <strong>LiteraryWorkSectionBody</strong>: pinta el campo <code>body</code> que el CMS declara dentro de cada sección, sea la obra en verso, en prosa, un ensayo o teatro. Recibe en el input <code>body</code> el HTML que el pipeline de Markdown ya saneó en el backend, y lo pinta con <code>[innerHTML]</code>, aportando la tipografía del contenedor (Source Serif Pro 20/34 sobre <code>neutral-800</code>).</p><p>Es el dueño de ese HTML: el <code>bypassSecurityTrustHtml</code> vive acá —sin él Angular recorta los atributos de carga que el propio pipeline inyecta en las imágenes— y las reglas tipográficas de los nodos que el pipeline emite, que no llevan clases y por eso ninguna utilidad alcanza, se anclan a su selector de elemento desde una hoja global. Por eso viajan con el componente y no con la página que lo consume.</p><p>No cubre la nota editorial ni el epígrafe de una sección, que resuelve <a href="./?path=/docs/componentes-v3-editorialnote--docs" target="_top"><strong>EditorialNote</strong></a> con su propio tratamiento. El componente no renderiza estado de carga: la página no lo monta hasta tener la obra.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		body: {
			control: { type: 'object' },
			table: { type: { summary: 'SanitizedHtml' }, defaultValue: { summary: 'required' } },
		},
	},
};

export default meta;
type Story = StoryObj<LiteraryWorkSectionBodyComponent>;

export const Parrafos: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-literary-work-section-body ${argsToTemplate(args)} />` }),
	args: { body: plainContent[0].bodyHtml },
	parameters: {
		docs: {
			description: {
				story: `<p>El caso corriente: una obra del canon cuyo cuerpo son párrafos con énfasis y negrita. Es donde se evalúa el ritmo de lectura — una línea en blanco entre párrafos, sin margen colgando al final del cuerpo.</p><p><strong>Usos:</strong> la página de lectura, una sección por vez.</p>`,
			},
		},
	},
};

export const ConCita: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-literary-work-section-body ${argsToTemplate(args)} />` }),
	args: { body: contentWithQuote[0].bodyHtml },
	parameters: {
		docs: {
			description: {
				story: `<p>Una obra del canon que transcribe un texto dentro del relato. La cita tiene que distinguirse por sí sola —barra lateral y sangría—, sin depender de las reglas horizontales que la rodeaban en el original impreso, y sin pesar como una nota del editor: un aviso dentro del relato lo sigue leyendo la voz de la obra.</p><p><strong>Usos:</strong> obras que citan un texto impreso, una carta o un cartel.</p>`,
			},
		},
	},
};

export const CoberturaDelPipeline: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-literary-work-section-body ${argsToTemplate(args)} />` }),
	args: { body: markdownToSanitizedHtml(createMarkdown(PIPELINE_COVERAGE_MARKDOWN)) },
	parameters: {
		docs: {
			description: {
				story: `<p>Todos los elementos que la lista blanca del saneamiento permite y hoy pueden aparecer en una obra: encabezados, cita de varios bloques, listas ordenadas y no ordenadas, regla horizontal, enlace, imagen y el salto de línea del verso. El canon no los ejercita —el de Onoff son párrafos y una cita—, así que esta story es la única evidencia visual de que ninguno se renderiza roto.</p><p><strong>Usos:</strong> validar con diseño el tratamiento de los elementos que el diseño todavía no cubre.</p>`,
			},
		},
	},
};

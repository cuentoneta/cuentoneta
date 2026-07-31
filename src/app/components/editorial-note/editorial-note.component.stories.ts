import { argsToTemplate, Meta, StoryObj } from '@storybook/angular-vite';

import { EditorialNoteComponent } from './editorial-note.component';
import { elOdioEpigraphMock } from '@mocks/onoff/el-odio.mock';

const content = elOdioEpigraphMock.text;
const reference = elOdioEpigraphMock.reference;

const meta: Meta<EditorialNoteComponent> = {
	component: EditorialNoteComponent,
	title: 'Componentes V3/EditorialNote',
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Bloque de texto editorial del Design System v3 para el contenido de <strong>LiteraryWork</strong>, <strong>EditorialNote</strong>: recibe HTML ya saneado por el backend (<code>SanitizedHtml</code>) y lo pinta con <code>[innerHTML]</code>, con el estilo de la variante elegida (input <code>variant</code>).</p><ul><li><strong>note</strong> (default): tarjeta neutra con borde, pensada como nota editorial de la obra; rinde <code>&lt;aside&gt;</code>, porque comenta la obra desde afuera.</li><li><strong>highlight</strong>: callout con tinte de marca y barra de acento, para el epígrafe de una sección; rinde <code>&lt;blockquote&gt;</code>, porque cita a un tercero.</li></ul><p>El pie de referencia (cuando existe) se conserva alineado a la derecha, en contraposición al diseño de Figma.</p><p>Es la contraparte de <a href="./?path=/docs/componentes-v3-editorialtextblock--docs" target="_top"><strong>EditorialTextBlock</strong></a>, que provee el mismo tratamiento visual para el contenido Portable Text de <strong>Story</strong>: mismo aspecto, contratos distintos.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		content: {
			control: { type: 'text' },
			table: { type: { summary: 'SanitizedHtml' }, defaultValue: { summary: 'required' } },
		},
		reference: {
			control: { type: 'text' },
			table: { type: { summary: 'SanitizedHtml' }, defaultValue: { summary: 'undefined' } },
		},
		variant: {
			control: { type: 'inline-radio' },
			options: ['note', 'highlight'],
			table: { type: { summary: "'note' | 'highlight'" }, defaultValue: { summary: 'note' } },
		},
	},
};

export default meta;
type Story = StoryObj<EditorialNoteComponent>;

export const Note: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-editorial-note ${argsToTemplate(args)} />` }),
	args: { content, variant: 'note' },
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>note</strong> (default): tarjeta neutra con borde, texto left-aligned. Es la superficie del Design System para la nota editorial de una obra.</p><p><strong>Usos:</strong> la nota editorial (<code>editorialNote</code>) al pie de la obra en la página de lectura.</p>`,
			},
		},
	},
};

export const NoteWithReference: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-editorial-note ${argsToTemplate(args)} />` }),
	args: { content, reference, variant: 'note' },
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>note</strong> con pie de referencia: la tarjeta neutra con el pie en cursiva alineado a la derecha. El pie es agnóstico a la variante (se muestra cuando llega el input <code>reference</code>), no una variante propia del componente.</p><p><strong>Usos:</strong> sin consumidor todavía; una nota editorial que cite su fuente (<code>editorialNote</code> no transporta referencia).</p>`,
			},
		},
	},
};

export const Highlight: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-editorial-note ${argsToTemplate(args)} />` }),
	args: { content, variant: 'highlight' },
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>highlight</strong> sin pie de referencia: callout con tinte de marca y barra de acento vertical, texto left-aligned.</p><p><strong>Usos:</strong> sin consumidor todavía; el epígrafe de sección de una obra es su destino natural.</p>`,
			},
		},
	},
};

export const HighlightWithReference: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-editorial-note ${argsToTemplate(args)} />` }),
	args: { content, reference, variant: 'highlight' },
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>highlight</strong> con pie de referencia: cuando llega <code>reference</code>, se muestra en cursiva alineada a la derecha (en contraposición al diseño de Figma). Es la misma <code>highlight</code> con referencia, no una variante propia.</p><p><strong>Usos:</strong> sin consumidor todavía; el epígrafe de sección de una obra, que casi siempre atribuye la cita.</p>`,
			},
		},
	},
};

export const Showcase: Story = {
	render: () => ({
		props: { content, reference },
		template: `
			<div class="flex flex-col gap-6">
				<cuentoneta-editorial-note [content]="content" variant="note" />
				<cuentoneta-editorial-note [content]="content" [reference]="reference" variant="note" />
				<cuentoneta-editorial-note [content]="content" variant="highlight" />
				<cuentoneta-editorial-note [content]="content" [reference]="reference" variant="highlight" />
			</div>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>Los cuatro casos: <strong>note</strong> y <strong>highlight</strong>, cada una sin y con pie de referencia (right-aligned). El pie es agnóstico a la variante. Cada variante lleva además su propia semántica: <code>note</code> rinde <code>&lt;aside&gt;</code> (comenta la obra desde afuera) y <code>highlight</code>, <code>&lt;blockquote&gt;</code> (cita a un tercero).</p><p><strong>Usos:</strong> comparación visual de las cuatro combinaciones; hoy solo <strong>note</strong> sin referencia tiene consumidor, en la página de lectura.</p>`,
			},
		},
	},
};

import { argsToTemplate, Meta, StoryObj } from '@storybook/angular-vite';

import { EditorialNoteComponent } from './editorial-note.component';
import { elOdioEpigraphMock } from '@mocks/onoff/el-odio.mock';
import { createAttributedText } from '@models/attributed-text.model';

// Del canon: el epígrafe de El odio trae texto y referencia; la variante sin atribución reusa su texto.
const noteWithReference = elOdioEpigraphMock;
const note = createAttributedText({ text: elOdioEpigraphMock.text });

const meta: Meta<EditorialNoteComponent> = {
	component: EditorialNoteComponent,
	title: 'Componentes V3/EditorialNote',
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Bloque de texto editorial del Design System v3 para el contenido de <strong>LiteraryWork</strong>, <strong>EditorialNote</strong>: recibe un <code>AttributedText</code> —un texto ya saneado por el backend con su atribución opcional— en el input <code>note</code>, y lo pinta con <code>[innerHTML]</code> con el estilo de la variante elegida (input <code>variant</code>).</p><ul><li><strong>note</strong> (default): tarjeta neutra con borde, pensada como nota editorial de la obra; rinde <code>&lt;aside&gt;</code>, porque comenta la obra desde afuera.</li><li><strong>highlight</strong>: callout con tinte de marca y barra de acento, para el epígrafe de una sección; rinde <code>&lt;blockquote&gt;</code>, porque cita a un tercero.</li></ul><p>El contenido y su referencia se emparejan dentro de una <code>&lt;figure&gt;</code>, con el pie como <code>&lt;figcaption&gt;</code> que cita la fuente en un <code>&lt;cite&gt;</code>. El pie (cuando existe) se conserva alineado a la derecha, en contraposición al diseño de Figma.</p><p>Sustituye a <strong>EditorialTextBlock</strong>, que da el mismo tratamiento visual al contenido Portable Text de <strong>Story</strong> y quedó deprecado: sobrevive sin entrada en este catálogo mientras la página de Story lo consuma.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		note: {
			control: { type: 'object' },
			table: { type: { summary: 'AttributedText' }, defaultValue: { summary: 'required' } },
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
	args: { note, variant: 'note' },
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
	args: { note: noteWithReference, variant: 'note' },
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>note</strong> con pie de referencia: la tarjeta neutra con el pie en cursiva alineado a la derecha. El pie es agnóstico a la variante (se muestra cuando el <code>note</code> trae <code>reference</code>), no una variante propia del componente.</p><p><strong>Usos:</strong> sin consumidor todavía; una nota editorial que cite su fuente (<code>editorialNote</code> no transporta referencia).</p>`,
			},
		},
	},
};

export const Highlight: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-editorial-note ${argsToTemplate(args)} />` }),
	args: { note, variant: 'highlight' },
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
	args: { note: noteWithReference, variant: 'highlight' },
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>highlight</strong> con pie de referencia: cuando el <code>note</code> trae <code>reference</code>, se muestra en cursiva alineada a la derecha (en contraposición al diseño de Figma). Es la misma <code>highlight</code> con referencia, no una variante propia.</p><p><strong>Usos:</strong> sin consumidor todavía; el epígrafe de sección de una obra, que casi siempre atribuye la cita.</p>`,
			},
		},
	},
};

export const Showcase: Story = {
	render: () => ({
		props: { note, noteWithReference },
		template: `
			<div class="flex flex-col gap-6">
				<cuentoneta-editorial-note [note]="note" variant="note" />
				<cuentoneta-editorial-note [note]="noteWithReference" variant="note" />
				<cuentoneta-editorial-note [note]="note" variant="highlight" />
				<cuentoneta-editorial-note [note]="noteWithReference" variant="highlight" />
			</div>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>Los cuatro casos: <strong>note</strong> y <strong>highlight</strong>, cada una sin y con pie de referencia (right-aligned). El pie es agnóstico a la variante. Cada variante lleva además su propia semántica dentro de la <code>&lt;figure&gt;</code>: <code>note</code> rinde <code>&lt;aside&gt;</code> (comenta la obra desde afuera) y <code>highlight</code>, <code>&lt;blockquote&gt;</code> (cita a un tercero).</p><p><strong>Usos:</strong> comparación visual de las cuatro combinaciones; hoy solo <strong>note</strong> sin referencia tiene consumidor, en la página de lectura.</p>`,
			},
		},
	},
};

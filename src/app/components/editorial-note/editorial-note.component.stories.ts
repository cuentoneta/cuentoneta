import type { Meta, StoryObj } from '@storybook/angular-vite';
import { argsToTemplate } from '@storybook/angular-vite';

import { EditorialNoteComponent } from './editorial-note.component';
import { attributedTextSelectArgType, corpusAttributedTexts } from '@mocks/onoff-corpus.storybook';
import { onoffLiteraryWorkEpigraphsMock } from '@mocks/onoff-literary-works.mock';
import { createAttributedText } from '@models/attributed-text.model';

// Del canon: un epígrafe cualquiera trae texto y referencia; la variante sin atribución reusa su texto.
const [noteWithReference] = onoffLiteraryWorkEpigraphsMock;
const note = createAttributedText({ text: noteWithReference.text });

const meta: Meta<EditorialNoteComponent> = {
	component: EditorialNoteComponent,
	title: 'Componentes V3/EditorialNote',
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Bloque de texto editorial del Design System v3 para el contenido de <strong>LiteraryWork</strong>, <strong>EditorialNote</strong>: recibe un <code>AttributedText</code> —un texto ya saneado por el backend con su atribución opcional— en el input <code>note</code>, y lo pinta con <code>[innerHTML]</code> con el estilo de la variante elegida (input <code>variant</code>).</p><ul><li><strong>note</strong> (default): tarjeta neutra con borde, pensada como nota editorial de la obra; rinde <code>&lt;aside&gt;</code>, porque comenta la obra desde afuera.</li><li><strong>highlight</strong>: callout con tinte de marca y barra de acento, para el epígrafe de una sección; rinde <code>&lt;blockquote&gt;</code>, porque cita a un tercero.</li></ul><p>El contenido y su referencia se emparejan dentro de una <code>&lt;figure&gt;</code>, con el pie como <code>&lt;figcaption&gt;</code> que cita la fuente en un <code>&lt;cite&gt;</code>. El pie (cuando existe) se conserva alineado a la derecha, en contraposición al diseño de Figma.</p></div>`,
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
		label: {
			control: { type: 'text' },
			table: { type: { summary: 'string' }, defaultValue: { summary: 'sin rótulo' } },
			description:
				'Nombre accesible de la nota, sin texto a la vista: vuelve al bloque una región navegable, que es como se distingue la voz del editor sin ver la tarjeta. Solo aplica a la variante note; la cita de highlight no se nombra',
		},
	},
};

export default meta;
type Story = StoryObj<EditorialNoteComponent>;

export const Note: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-editorial-note ${argsToTemplate(args)} />` }),
	args: { note, variant: 'note', label: 'Nota editorial' },
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>note</strong> (default): tarjeta neutra con borde, texto left-aligned. Es la superficie del Design System para la nota editorial de una obra. Con <code>label</code>, el bloque se anuncia como región propia sin que aparezca texto alguno en pantalla: es la distinción que la tarjeta hace por su forma, dicha para quien no la ve.</p><p><strong>Usos:</strong> la nota editorial (<code>editorialNote</code>) al pie de la obra en la página de lectura.</p>`,
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
				story: `<p>Variante <strong>highlight</strong> sin pie de referencia: callout con tinte de marca y barra de acento vertical, texto left-aligned.</p><p><strong>Usos:</strong> el epígrafe de una sección en la página de lectura, cuando la cita no declara su fuente.</p>`,
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
				story: `<p>Variante <strong>highlight</strong> con pie de referencia: cuando el <code>note</code> trae <code>reference</code>, se muestra en cursiva alineada a la derecha (en contraposición al diseño de Figma). Es la misma <code>highlight</code> con referencia, no una variante propia.</p><p><strong>Usos:</strong> el epígrafe de una sección en la página de lectura, que casi siempre atribuye la cita.</p>`,
			},
		},
	},
};

export const Interactiva: StoryObj<EditorialNoteComponent & { attributedTextIndex: number }> = {
	argTypes: {
		attributedTextIndex: {
			...attributedTextSelectArgType,
			description:
				'Texto del corpus de François Onoff: los epígrafes de sección traen atribución y las notas editoriales no, así que el pie de la figura aparece o desaparece al cambiar de opción. Alguno ocupa más de una línea porque su fuente lo declara, que es donde se ve cómo respira la figura con un texto en verso',
		},
	},
	render: (args) => ({
		props: { ...args, attributedTexts: corpusAttributedTexts },
		template: `<cuentoneta-editorial-note [note]="attributedTexts[attributedTextIndex]" [variant]="variant" />`,
	}),
	args: { attributedTextIndex: 0, variant: 'note' },
	parameters: {
		docs: {
			description: {
				story: `<p>Recorre los textos con atribución del canon: cada epígrafe de sección y cada nota editorial de las obras de Onoff, combinables con las dos variantes.</p><p><strong>Usos:</strong> comparar cómo cae el mismo tratamiento visual sobre textos de largo distinto, y ver la figura con y sin pie según el texto traiga o no su fuente.</p>`,
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
				story: `<p>Los cuatro casos: <strong>note</strong> y <strong>highlight</strong>, cada una sin y con pie de referencia (right-aligned). El pie es agnóstico a la variante. Cada variante lleva además su propia semántica dentro de la <code>&lt;figure&gt;</code>: <code>note</code> rinde <code>&lt;aside&gt;</code> (comenta la obra desde afuera) y <code>highlight</code>, <code>&lt;blockquote&gt;</code> (cita a un tercero).</p><p><strong>Usos:</strong> comparación visual de las cuatro combinaciones; la página de lectura consume <strong>note</strong> sin referencia para la nota editorial de la obra, y <strong>highlight</strong> para el epígrafe de cada sección.</p>`,
			},
		},
	},
};

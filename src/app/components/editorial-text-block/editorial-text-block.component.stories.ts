import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';

import { EditorialTextBlockComponent } from './editorial-text-block.component';
import { Epigraph } from '@models/story.model';
import { epigraphMock } from '@mocks/epigraph-mock';

const epigraphWithoutReference: Epigraph = { ...epigraphMock, reference: [] };

const meta: Meta<EditorialTextBlockComponent> = {
	component: EditorialTextBlockComponent,
	title: 'Componentes V3/EditorialTextBlock',
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Bloque de texto editorial del Design System v3, <strong>EditorialTextBlock</strong>: renderiza contenido Portable Text (intro en negrita y enlaces vía marcas <code>strong</code>/<code>link</code>) con el estilo de la variante elegida (input <code>variant</code>).</p><ul><li><strong>note</strong> (default): tarjeta neutra con borde, pensada como nota editorial al pie del cuento.</li><li><strong>highlight</strong>: callout con tinte de marca y barra de acento; es la variante que reemplaza a la epígrafe en la página Story.</li></ul><p>El pie de referencia (cuando existe) se conserva alineado a la derecha, en contraposición al diseño de Figma.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		content: { control: { type: 'object' }, table: { type: { summary: 'Epigraph' } } },
		variant: {
			control: { type: 'inline-radio' },
			options: ['note', 'highlight'],
			table: { defaultValue: { summary: 'note' } },
		},
	},
};

export default meta;
type Story = StoryObj<EditorialTextBlockComponent>;

export const Note: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-editorial-text-block ${argsToTemplate(args)} />` }),
	args: { content: epigraphWithoutReference, variant: 'note' },
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>note</strong> (default): tarjeta neutra con borde, texto left-aligned. Es la superficie del Design System para una nota editorial al pie del cuento.</p><p><strong>Usos:</strong> sin consumidor real todavía (no existe una fuente de datos de dominio para "nota editorial" fuera de las epígrafes); disponible como capacidad del DS.</p>`,
			},
		},
	},
};

export const Highlight: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-editorial-text-block ${argsToTemplate(args)} />` }),
	args: { content: epigraphMock, variant: 'highlight' },
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>highlight</strong>: callout con tinte de marca y barra de acento vertical, texto left-aligned. Cuando el contenido trae referencia, se muestra en cursiva alineada a la derecha.</p><p><strong>Usos:</strong> Story (reemplaza a la epígrafe).</p>`,
			},
		},
	},
};

export const Showcase: Story = {
	render: () => ({
		props: { note: epigraphWithoutReference, highlight: epigraphMock },
		template: `
			<div class="flex flex-col gap-6">
				<cuentoneta-editorial-text-block [content]="note" variant="note" />
				<cuentoneta-editorial-text-block [content]="highlight" variant="highlight" />
			</div>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story: 'Las dos variantes: note (tarjeta neutra) y highlight (callout de marca, con referencia).',
			},
		},
	},
};

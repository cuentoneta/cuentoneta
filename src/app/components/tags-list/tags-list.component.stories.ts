import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { TagsListComponent } from './tags-list.component';
import { TagComponent } from '../tag/tag.component';
import { Tag } from '@models/tag.model';

const tags: Tag[] = [
	{ title: 'Crónica', slug: 'cronica', shortDescription: '', description: [] },
	{ title: 'Ensayo', slug: 'ensayo', shortDescription: '', description: [] },
	{ title: 'Memoria', slug: 'memoria', shortDescription: '', description: [] },
	{ title: 'Histórico', slug: 'historico', shortDescription: '', description: [] },
	{ title: 'Política', slug: 'politica', shortDescription: '', description: [] },
];

/** Proyecta los tags dentro del componente (la API es por content projection). */
const projected = `<cuentoneta-tags-list [variant]="variant" [maxVisible]="maxVisible">
		@for (tag of tags; track tag.slug) {
			<cuentoneta-tag [label]="tag.title" [variant]="variant" />
		}
	</cuentoneta-tags-list>`;

/** Caja con ancho fijo y borde punteado para evidenciar dónde recorta el contenedor. */
const boxed = (width: string) =>
	componentWrapperDecorator(
		(story) => `<div style="width:${width}; outline:1px dashed #cbd5e1; border-radius:8px; padding:8px">${story}</div>`,
	);

const meta: Meta<TagsListComponent & { tags: Tag[]; maxVisible?: number }> = {
	component: TagsListComponent,
	title: 'Componentes/TagsList',
	decorators: [moduleMetadata({ imports: [TagComponent] })],
	parameters: {
		docs: {
			description: {
				component: `<div>
					<p>El componente **TagsListComponent** recibe los tags por <strong>content projection</strong>
					(<code>&lt;ng-content&gt;</code>) y, cuando <strong>no entran en el ancho del contenedor</strong>,
					colapsa el excedente detrás de un contador <strong>"+N"</strong> de ancho fijo ubicado justo
					después del último tag visible.</p>
					<p>El recorte es <strong>por ancho real</strong> (vía <code>IntersectionObserver</code>, sin
					<code>ResizeObserver</code>), no por cantidad, y vive en <code>TagsOverflowDirective</code> aplicada
					como <code>hostDirective</code>. <code>maxVisible</code> es un <strong>tope duro opcional</strong>.</p>
					<p>Probá el <em>Playground</em> para arrastrar el ancho y ver el contador aparecer/desaparecer en vivo.</p>
				</div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		variant: {
			control: { type: 'inline-radio' },
			options: ['soft', 'filled', 'gray'],
			table: { defaultValue: { summary: 'filled' } },
		},
		maxVisible: {
			control: { type: 'number' },
			description: 'Tope duro opcional de tags visibles. Vacío = recorte solo por ancho.',
			table: { defaultValue: { summary: '— (sin tope)' } },
		},
	},
};

export default meta;
type Story = StoryObj<TagsListComponent & { tags: Tag[]; maxVisible?: number }>;

// Contenedor ancho: entran todos, no se muestra contador.
export const Default: Story = {
	render: (args) => ({ props: { ...args, tags }, template: projected }),
	args: { variant: 'filled' },
	decorators: [boxed('100%')],
	parameters: { docs: { description: { story: 'Con espacio de sobra, los 5 tags se muestran sin contador.' } } },
};

// Contenedor acotado: el excedente que no entra por ancho se colapsa en "+N".
export const WidthOverflow: Story = {
	render: (args) => ({ props: { ...args, tags }, template: projected }),
	args: { variant: 'filled' },
	decorators: [boxed('240px')],
	parameters: {
		docs: {
			description: {
				story: 'En 240px no entran los 5 tags: los que sobran se colapsan tras un "+N" después del último visible.',
			},
		},
	},
};

// Contenedor muy angosto: entran muy pocos y el contador refleja el resto.
export const NarrowWidth: Story = {
	render: (args) => ({ props: { ...args, tags }, template: projected }),
	args: { variant: 'filled' },
	decorators: [boxed('130px')],
	parameters: { docs: { description: { story: 'A 130px casi nada entra; el contador refleja todo lo colapsado.' } } },
};

// Tope duro: el contenedor daría para más, pero maxVisible corta antes.
export const MaxVisibleCap: Story = {
	render: (args) => ({ props: { ...args, tags }, template: projected }),
	args: { variant: 'filled', maxVisible: 2 },
	decorators: [boxed('100%')],
	parameters: {
		docs: {
			description: {
				story: 'Con ancho de sobra pero maxVisible=2, se muestran 2 + "+3"; el tope manda sobre el ancho.',
			},
		},
	},
};

// Las tres variantes recortando por ancho en cajas idénticas.
export const Variants: Story = {
	render: () => ({
		props: { tags },
		template: `
			<div class="flex flex-col gap-6">
				@for (variant of ['soft', 'filled', 'gray']; track variant) {
					<div style="width:240px; outline:1px dashed #cbd5e1; border-radius:8px; padding:8px">
						<cuentoneta-tags-list [variant]="variant">
							@for (tag of tags; track tag.slug) {
								<cuentoneta-tag [label]="tag.title" [variant]="variant" />
							}
						</cuentoneta-tags-list>
					</div>
				}
			</div>
		`,
	}),
	parameters: {
		docs: { description: { story: 'soft / filled / gray recortando por ancho en contenedores de 240px.' } },
	},
};

// Caja redimensionable: arrastrá el borde inferior-derecho para ver el contador reaccionar al ancho.
export const Playground: Story = {
	render: (args) => ({ props: { ...args, tags }, template: projected }),
	args: { variant: 'filled' },
	decorators: [
		componentWrapperDecorator(
			(story) =>
				`<div style="width:260px; max-width:100%; resize:horizontal; overflow:hidden; outline:1px dashed #cbd5e1; border-radius:8px; padding:8px">${story}</div>`,
		),
	],
	parameters: {
		docs: {
			description: {
				story: 'Arrastrá el handle de resize del contenedor: el "+N" aparece/desaparece según el ancho disponible.',
			},
		},
	},
};

import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';

import { HighlightedAuthorsComponent } from './highlighted-authors.component';
import { SectionHeaderComponent } from '@components/section-header/section-header.component';
import { AuthorCardTeaserSkeletonComponent } from '@components/author-card-teaser/author-card-teaser-skeleton.component';
import { onoffHighlightedAuthorsOfLength, onoffUntaggedHighlightedAuthor } from '@mocks/onoff-highlighted-authors.mock';

// Un solo dataset compartido por todas las stories: los mismos destacados en cada estado hacen que el
// switch del catálogo compare siempre lo mismo.
const SKELETON_COUNT = 6;
const highlightedAuthors = onoffHighlightedAuthorsOfLength(SKELETON_COUNT);

// La grilla sin etiquetas, que es el estado con el que la sección sale a producción.
const untaggedAuthors = highlightedAuthors.map((highlighted) => ({
	...highlighted,
	tags: onoffUntaggedHighlightedAuthor.tags,
}));

const meta: Meta<HighlightedAuthorsComponent> = {
	component: HighlightedAuthorsComponent,
	title: 'Componentes V3/HighlightedAuthors',
	decorators: [
		moduleMetadata({
			imports: [SectionHeaderComponent, AuthorCardTeaserSkeletonComponent],
		}),
	],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El <strong>HighlightedAuthors</strong> es la sección de autores destacados de la página de inicio en el Design System v3: un <a href="./?path=/docs/componentes-v3-sectionheader--docs" target="_top"><strong>SectionHeader</strong></a> con el título "Autores/as destacados/as", su bajada y el enlace al índice de autores, más una grilla responsiva de una columna en mobile, dos desde <code>sm</code> y tres desde <code>lg</code>, con una vista previa por autor resuelta por <a href="./?path=/docs/componentes-v3-authorcardteaser--docs" target="_top"><strong>AuthorCardTeaser</strong></a>.</p><p>Está tipado contra <strong>HighlightedAuthor</strong>, la proyección de curación semanal del contenido de la página de inicio, que compone el teaser del autor con las etiquetas de la tirada y su cantidad de obras. La curaduría y el tope de seis los decide el backend: el componente presenta lo que recibe, sin recortar ni ordenar. Mientras difiere la carga dibuja los skeletons de <strong>AuthorCardTeaserSkeleton</strong> dentro de su bloque <code>@defer</code>, y sin destacados queda solo el encabezado.</p></div>`,
			},
		},
	},
	argTypes: {
		authors: {
			control: { type: 'object' },
			description: 'Autores destacados de la semana; vacío deja solo el encabezado',
			table: { type: { summary: 'readonly HighlightedAuthor[]' }, defaultValue: { summary: '[]' } },
		},
	},
};
export default meta;
type Story = StoryObj<HighlightedAuthorsComponent>;

export const Primary: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-highlighted-authors ${argsToTemplate(args)} />`,
	}),
	args: {
		authors: highlightedAuthors,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Seis destacados derivados del canon de Onoff mediante el selector del agregador de mocks; la grilla arma dos filas de tres desde viewport <code>lg</code>.</p><p>Los seis salen del mismo autor canónico, así que comparten retrato, nacionalidad y cantidad de obras: la grilla se ve más pareja de lo que se verá con contenido real, y no ejercita nombres de largo dispar ni banderas distintas. Se corrige al ampliar el corpus con autores propios.</p><p><strong>Usos:</strong> la sección de autores destacados de la página de inicio.</p>`,
			},
		},
	},
};

export const SinEtiquetas: Story = {
	name: 'Sin etiquetas',
	render: (args) => ({
		props: args,
		template: `<cuentoneta-highlighted-authors ${argsToTemplate(args)} />`,
	}),
	args: {
		authors: untaggedAuthors,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>La grilla sin etiquetas de autor. <strong>No es un borde: es el estado con el que la sección sale a producción</strong>, porque las etiquetas del autor se derivan de las editoriales de sus obras y esa reconciliación todavía no corre.</p><p>Es la story contra la que hay que dar el diseño por bueno: sin la fila de etiquetas, la tarjeta pierde alto y la grilla se compacta.</p><p><strong>Usos:</strong> la sección de autores destacados de la página de inicio, en su estado de salida.</p>`,
			},
		},
	},
};

// La rama de carga replica el shell de la sección (encabezado + grilla internos): es lo que se ve
// mientras corre el @defer. Los esqueletos son una cantidad fija, igual que en el componente: la grilla
// en carga dibuja la sección llena aunque todavia no haya llegado ningun destacado.
// Bindings explícitos (no argsToTemplate) porque loading no es un input del componente, y
// argsToTemplate generaría [loading]="loading" contra un destino inexistente.
export const Estados: StoryObj<HighlightedAuthorsComponent & { loading: boolean; skeletonCount: number }> = {
	argTypes: {
		loading: { control: 'boolean', name: 'Cargando' },
		skeletonCount: { table: { disable: true } },
	},
	render: (args) => ({
		props: args,
		template: `
			@if (loading) {
				<div class="flex flex-col gap-8">
					<cuentoneta-section-header
						heading="Autores/as destacados/as"
						subtitle="Una selección curada de autores y autoras imprescindibles"
						[actionLink]="['/', 'authors']"
						actionAriaLabel="Ver todos los autores"
					/>
					<section class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
						@for (_ of [].constructor(skeletonCount); track $index) {
							<cuentoneta-author-card-teaser-skeleton class="w-full" data-testid="skeleton" />
						}
					</section>
				</div>
			} @else {
				<cuentoneta-highlighted-authors [authors]="authors" />
			}
		`,
	}),
	args: {
		loading: true,
		skeletonCount: SKELETON_COUNT,
		authors: highlightedAuthors,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Activá/desactivá "Cargando" para alternar entre el estado real y el estado de carga de la sección: encabezado fijo más la grilla llena de esqueletos. La cantidad es fija y no sigue a lo recibido, porque el esqueleto tiene que dibujar la sección completa aunque todavía no haya llegado ningún destacado. El enlace "Ver todo" no se replica: la rama de carga no navega.<br><br><strong>Usos:</strong> la sección de autores destacados de la página de inicio, mientras resuelve el contenido de la semana.',
			},
		},
	},
};

export const Vacia: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-highlighted-authors ${argsToTemplate(args)} />`,
	}),
	args: {
		authors: [],
	},
	parameters: {
		docs: {
			description: {
				story:
					'Sin destacados el @defer no dispara: queda el encabezado de sección con su enlace al índice de autores, sin tarjetas ni skeletons. Es el valor default del input authors, y el enlace sigue siendo navegable.<br><br><strong>Usos:</strong> la sección de autores destacados de la página de inicio, en una semana sin curaduría cargada.',
			},
		},
	},
};

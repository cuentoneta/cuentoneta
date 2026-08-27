import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';

import { CollectionTeasersDeck } from './collection-teasers-deck';
import { SectionHeaderComponent } from '@components/section-header/section-header.component';
import { CollectionTeaserCardSkeletonComponent } from '@components/collection-teaser-card/collection-teaser-card-skeleton';
import { onoffCollectionTeasersOfLength } from '@mocks/onoff-collections.mock';

// Un solo dataset compartido por todas las stories: mismas colecciones en cada estado hace que el
// switch del catálogo compare siempre lo mismo.
const deckTeasers = onoffCollectionTeasersOfLength(4);

const meta: Meta<CollectionTeasersDeck> = {
	component: CollectionTeasersDeck,
	title: 'Componentes V3/CollectionTeasersDeck',
	decorators: [
		moduleMetadata({
			imports: [SectionHeaderComponent, CollectionTeaserCardSkeletonComponent],
		}),
	],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El <strong>CollectionTeasersDeck</strong> es el bloque de sección que agrupa colecciones en el Design System v3: un <a href="./?path=/docs/componentes-v3-sectionheader--docs" target="_top"><strong>SectionHeader</strong></a> con el título "Colecciones", su bajada y el enlace al índice de colecciones, sobre una grilla responsiva de una columna en mobile y dos desde <code>sm</code>, con una tarjeta por colección resuelta por <a href="./?path=/docs/componentes-v3-collectionteasercard--docs" target="_top"><strong>CollectionTeaserCard</strong></a>.</p><p>Está tipado contra el modelo de dominio <strong>Collection</strong> vía su proyección <code>CollectionTeaser</code>; mientras difiere la carga dibuja los skeletons de <strong>CollectionTeaserCardSkeleton</strong> dentro de su bloque <code>@defer</code>, y sin colecciones queda solo el encabezado.</p></div>`,
			},
		},
	},
	argTypes: {
		teasers: {
			control: { type: 'object' },
			description: 'Colecciones a mostrar en la grilla; vacío deja solo el encabezado',
			table: { type: { summary: 'readonly CollectionTeaser[]' }, defaultValue: { summary: '[]' } },
		},
	},
};
export default meta;
type Story = StoryObj<CollectionTeasersDeck>;

export const Primary: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-collection-teasers-deck ${argsToTemplate(args)} />`,
	}),
	args: {
		teasers: deckTeasers,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Colecciones derivadas del canon de Onoff mediante el selector del agregador de mocks; la grilla arma una fila por cada dos tarjetas desde viewport <code>sm</code>.</p><p>Las cuatro salen de la misma colección canónica, así que comparten portada, prosa y etiqueta: la grilla se ve más pareja de lo que se verá con contenido real, y no ejercita portadas dispares ni descripciones de largo distinto. Se corrige al ampliar el corpus con colecciones propias.</p><p><strong>Usos:</strong> la grilla de colecciones del Design System v3 (todavía sin consumidor en páginas).</p>`,
			},
		},
	},
};

// La rama de carga replica el shell del deck (encabezado + grilla internos): es lo que el usuario
// ve mientras corre el @defer, y replicarlo completo mantiene 1:1 el alto contra el estado real.
// Bindings explícitos (no argsToTemplate) porque loading no es un input del componente, y
// argsToTemplate generaría [loading]="loading" contra un destino inexistente.
export const Estados: StoryObj<CollectionTeasersDeck & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			@if (loading) {
				<div class="flex flex-col gap-8">
					<cuentoneta-section-header
						heading="Colecciones"
						subtitle="Obras agrupadas por temas, estilos y universos en común"
						[action]="{ link: ['/', 'collection'], accessibleSuffix: 'el índice de colecciones' }"
					/>
					<section class="mb-8 grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2">
						@for (_ of teasers; track $index) {
							<cuentoneta-collection-teaser-card-skeleton class="card w-full" />
						}
					</section>
				</div>
			} @else {
				<cuentoneta-collection-teasers-deck [teasers]="teasers" />
			}
		`,
	}),
	args: {
		loading: true,
		teasers: deckTeasers,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Activá/desactivá "Cargando" para alternar entre el estado real y el estado de carga del deck: encabezado fijo más un esqueleto por slot de la grilla —iterando los mismos datos, la paridad con la rama real vale por construcción—.',
			},
		},
	},
};

export const Vacia: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-collection-teasers-deck ${argsToTemplate(args)} />`,
	}),
	args: {
		teasers: [],
	},
	parameters: {
		docs: {
			description: {
				story:
					'Sin colecciones el @defer no dispara: queda el encabezado de sección, sin tarjetas ni skeletons. Es el valor default del input teasers.',
			},
		},
	},
};

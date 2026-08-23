import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';

import { CollectionTeasersDeck } from './collection-teasers-deck';
import { CollectionTeaserCardSkeletonComponent } from '@components/collection-teaser-card/collection-teaser-card-skeleton';
import { onoffCollectionTeasersMock } from '@mocks/onoff-collections.mock';
import { createCollectionTeaser, type CollectionTeaser } from '@models/collection.model';

// El agregado de dominio está congelado: los teasers adicionales salen de la factory del modelo,
// no de un spread, para no saltear las invariantes que ella hace cumplir.
function teasersOfLength(count: number): CollectionTeaser[] {
	const [base] = onoffCollectionTeasersMock;
	return Array.from({ length: count }, (_, index) =>
		createCollectionTeaser({
			_id: `${base._id}-${index + 1}`,
			slug: `${base.slug}-${index + 1}`,
			title: `Colección ${index + 1}`,
			description: base.description,
			imagery: base.imagery,
			tags: base.tags,
			config: base.config,
			mediaSources: base.mediaSources,
			count: base.count,
		}),
	);
}

const meta: Meta<CollectionTeasersDeck> = {
	component: CollectionTeasersDeck,
	title: 'Componentes V3/CollectionTeasersDeck',
	tags: ['autodocs'],
	decorators: [
		moduleMetadata({
			imports: [CollectionTeaserCardSkeletonComponent],
		}),
	],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El <strong>CollectionTeasersDeck</strong> es el bloque de sección que agrupa colecciones en el Design System v3: encabezado "Colecciones" con subtítulo y grilla responsiva de una columna en mobile y dos desde <code>sm</code>, con una tarjeta por colección resuelta por <a href="./?path=/docs/componentes-v3-collectionteasercard--docs" target="_top"><strong>CollectionTeaserCard</strong></a>.</p><p>Está tipado contra el modelo de dominio <strong>Collection</strong> vía su proyección <code>CollectionTeaser</code>; mientras difiere la carga dibuja cuatro skeletons de <strong>CollectionTeaserCardSkeleton</strong> dentro de su bloque <code>@defer</code>, y sin colecciones queda solo el encabezado.</p></div>`,
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

export const Primary: StoryObj<CollectionTeasersDeck> = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-collection-teasers-deck ${argsToTemplate(args)} />`,
	}),
	args: {
		teasers: teasersOfLength(4),
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Cuatro colecciones derivadas del canon de Onoff con la factory del dominio: dos filas de tarjetas desde viewport <code>sm</code>.</p><p><strong>Usos:</strong> la grilla de colecciones del Design System v3 (todavía sin consumidor en páginas).</p>`,
			},
		},
	},
};

// La rama de carga replica el shell del deck (encabezado + grilla internos): es lo que el usuario
// ve mientras corre el @defer, y replicarlo completo mantiene 1:1 el alto contra el estado real.
export const Estados: StoryObj<CollectionTeasersDeck & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			@if (loading) {
				<div class="flex flex-col gap-8">
					<div class="flex items-center justify-between">
						<div class="flex flex-col content-between gap-1">
							<h2 class="font-inter text-2xl font-bold">Colecciones</h2>
							<div class="font-inter text-sm text-neutral-600">Obras agrupadas por temas, estilos y universos en común</div>
						</div>
					</div>
					<section class="mb-8 grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2">
						<cuentoneta-collection-teaser-card-skeleton class="card w-full" />
						<cuentoneta-collection-teaser-card-skeleton class="card w-full" />
						<cuentoneta-collection-teaser-card-skeleton class="card w-full" />
						<cuentoneta-collection-teaser-card-skeleton class="card w-full" />
					</section>
				</div>
			} @else {
				<cuentoneta-collection-teasers-deck [teasers]="teasers" />
			}
		`,
	}),
	args: {
		loading: true,
		teasers: teasersOfLength(4),
	},
	parameters: {
		docs: {
			description: {
				story:
					'Activá/desactivá "Cargando" para alternar entre el estado real y el estado de carga del deck: encabezado fijo más cuatro skeletons, idénticos a los que dibuja su bloque @defer.',
			},
		},
	},
};

export const Vacia: StoryObj<CollectionTeasersDeck> = {
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

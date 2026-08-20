import { Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';

import { CollectionTeaserCard } from './collection-teaser-card';
import { CollectionTeaserCardSkeletonComponent } from './collection-teaser-card-skeleton';
import {
	geometriasDelDesveloCollectionTeaserMock,
	inventarioDeLasPasionesCollectionTeaserMock,
} from '@mocks/onoff-collections.mock';

const meta: Meta<CollectionTeaserCard> = {
	component: CollectionTeaserCard,
	title: 'Componentes V3/CollectionTeaserCard',
	decorators: [
		moduleMetadata({
			imports: [CollectionTeaserCardSkeletonComponent],
		}),
	],
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div><p>El <strong>CollectionTeaserCard</strong> es la tarjeta de una colección para el Design System v3, tipada contra el modelo de dominio <strong>Collection</strong>: portada, título, descripción y footer con tag y contador de obras. La portada la resuelve <a href="./?path=/docs/componentes-v3-collectioncover--docs" target="_top"><strong>CollectionCover</strong></a> a partir del objeto de valor <strong>imagery</strong>, en sus dos formas; la tarjeta solo aporta el marco gris que la recorta y la centra.</p><p>La descripción llega del backend como HTML ya saneado y se pinta con <code>[innerHTML]</code>, porque el pipeline emite su propio <code>&lt;p&gt;</code>. Sustituye a <strong>StorylistTeaserCard</strong>, que muestra lo mismo desde el agregado en baja: sobrevive sin entrada en este catálogo mientras la home lo consuma. Las dos comparten el skeleton, que no depende del modelo.</p></div>`,
			},
		},
	},
	argTypes: {
		collection: {
			control: { type: 'object' },
			description: 'Colección a previsualizar (título, descripción, tags, contador e imagery)',
			table: { type: { summary: 'CollectionTeaser' }, defaultValue: { summary: 'undefined' } },
		},
	},
};
export default meta;

export const Primary: StoryObj<CollectionTeaserCard> = {
	render: () => ({
		props: {
			representative: geometriasDelDesveloCollectionTeaserMock,
			sample: inventarioDeLasPasionesCollectionTeaserMock,
		},
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <cuentoneta-collection-teaser-card class="card" [collection]="representative"/>
          <cuentoneta-collection-teaser-card class="card" [collection]="sample"/>
    </div>
`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>Columna izquierda: variante representative (portada editorial propia). Columna derecha: variante sample (composición de portadas de obras).</p><p><strong>Usos:</strong> la página de colecciones, en la grilla de colecciones.</p>`,
			},
		},
	},
};

export const Interactiva: StoryObj<CollectionTeaserCard & { kind: 'representative' | 'sample' }> = {
	argTypes: {
		kind: {
			control: { type: 'inline-radio' },
			options: ['representative', 'sample'],
			name: 'Tipo de imagery',
		},
	},
	render: (args) => ({
		props: {
			collection:
				args.kind === 'representative'
					? geometriasDelDesveloCollectionTeaserMock
					: inventarioDeLasPasionesCollectionTeaserMock,
		},
		template: `
			<div class="card p-4">
				<cuentoneta-collection-teaser-card [collection]="collection" />
			</div>
		`,
	}),
	args: { kind: 'sample' },
	parameters: {
		docs: {
			description: {
				story: `<p>Cambiá "Tipo de imagery" para alternar entre la variante representative (portada editorial propia) y sample (composición de 3 portadas de obras).</p><p><strong>Usos:</strong> usar representative cuando la colección tiene portada editorial y sample cuando se compone de las portadas de sus obras.</p>`,
			},
		},
	},
};

export const Estados: StoryObj<CollectionTeaserCard & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			<div class="card p-4">
				@if (loading) {
					<cuentoneta-collection-teaser-card-skeleton class="w-full" />
				} @else {
					<cuentoneta-collection-teaser-card [collection]="collection" />
				}
			</div>
		`,
	}),
	args: { loading: true, collection: geometriasDelDesveloCollectionTeaserMock },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

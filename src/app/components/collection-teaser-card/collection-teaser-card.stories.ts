import { Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';

import { CollectionTeaserCard } from './collection-teaser-card';
import { CollectionTeaserCardSkeletonComponent } from './collection-teaser-card-skeleton';
import {
	onoffCollectionTeasersWithRepresentativeImageryMock,
	onoffCollectionTeasersWithSampleImageryMock,
} from '@mocks/onoff-collections.mock';
import { collectionTeaserCardDocs } from './collection-teaser-card.docs';
import { collectionCoverDocs } from '../collection-cover/collection-cover.component.docs';
import { collectionTeasersDeckDocs } from '../collection-teasers-deck/collection-teasers-deck.docs';
import { collectionsPageDocs } from '../../pages/collections/collections.page.docs';
import { docsMention, docsRef } from '@testing/storybook-docs';
import type { Collection } from '../../../sanity/types';

// Los símbolos que la prosa de esta story nombra sin enlazar. La tupla no se usa en runtime:
// existe para que el import type-only rompa el `typecheck` si alguno deja de estar declarado.
export type DocsSymbols = [Collection];

const [representativeTeaser] = onoffCollectionTeasersWithRepresentativeImageryMock;
const [sampleTeaser] = onoffCollectionTeasersWithSampleImageryMock;

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
				component: `<div><p>El ${docsMention(collectionTeaserCardDocs)} es la tarjeta de una colección para el Design System v3, tipada contra el modelo de dominio <strong>Collection</strong>: portada, título, descripción y footer con tag y contador de obras. La portada la resuelve ${docsRef(collectionCoverDocs)} a partir del objeto de valor <strong>imagery</strong>, en sus dos formas; la tarjeta solo aporta el marco gris que la recorta y la centra.</p><p>La descripción llega del backend como HTML ya saneado y se pinta con <code>[innerHTML]</code>, porque el pipeline emite su propio <code>&lt;p&gt;</code>. Su skeleton vive en el mismo directorio y no depende del modelo: lo dibujan ${docsRef(collectionTeasersDeckDocs)} y ${docsRef(collectionsPageDocs)} mientras resuelven sus datos.</p></div>`,
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
			representative: representativeTeaser,
			sample: sampleTeaser,
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
			collection: args.kind === 'representative' ? representativeTeaser : sampleTeaser,
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
	args: { loading: true, collection: representativeTeaser },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

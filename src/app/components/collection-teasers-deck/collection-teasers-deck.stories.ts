import { argsToTemplate, Meta, StoryObj } from '@storybook/angular-vite';

import { CollectionTeasersDeck } from './collection-teasers-deck';
import { onoffCollectionTeasersOfLength } from '@mocks/onoff-collections.mock';
import { collectionTeasersDeckDocs } from './collection-teasers-deck.docs';
import { collectionTeaserCardDocs } from '../collection-teaser-card/collection-teaser-card.docs';
import { emptyStateDocs } from '../empty-state/empty-state.component.docs';
import { sectionHeaderDocs } from '../section-header/section-header.component.docs';
import { docsMention, docsRef } from '@testing/storybook-docs';
import type { Collection } from '../../../sanity/types';
import type { CollectionTeaserCardSkeletonComponent } from '@components/collection-teaser-card/collection-teaser-card-skeleton';

// Los símbolos que la prosa de esta story nombra sin enlazar. La tupla no se usa en runtime:
// existe para que el import type-only rompa el `typecheck` si alguno deja de estar declarado.
export type DocsSymbols = [Collection, CollectionTeaserCardSkeletonComponent];

// Un solo dataset compartido por todas las stories: mismas colecciones en cada estado hace que el
// switch del catálogo compare siempre lo mismo.
const deckTeasers = onoffCollectionTeasersOfLength(4);

const meta: Meta<CollectionTeasersDeck> = {
	component: CollectionTeasersDeck,
	title: 'Componentes V3/CollectionTeasersDeck',
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El ${docsMention(collectionTeasersDeckDocs)} es el bloque de sección que agrupa colecciones en el Design System v3: un ${docsRef(sectionHeaderDocs)} con el título "Colecciones", su bajada y el enlace al índice de colecciones, sobre una grilla responsiva de una columna en mobile y dos desde <code>sm</code>, con una tarjeta por colección resuelta por ${docsRef(collectionTeaserCardDocs)}.</p><p>Está tipado contra el modelo de dominio <strong>Collection</strong> vía su proyección <code>CollectionTeaser</code>; el estado de carga entra por input, porque el dueño del recurso es la página: cargando dibuja los skeletons de <strong>CollectionTeaserCardSkeletonComponent</strong>, con colecciones la grilla, y sin colecciones el aviso de ${docsRef(emptyStateDocs)}.</p></div>`,
			},
		},
	},
	argTypes: {
		teasers: {
			control: { type: 'object' },
			description: 'Colecciones a mostrar en la grilla; vacío deja solo el encabezado',
			table: { type: { summary: 'readonly CollectionTeaser[]' }, defaultValue: { summary: '[]' } },
		},
		loading: {
			control: { type: 'boolean' },
			description: 'Estado de carga del recurso que alimenta la grilla; lo decide la página',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
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
				story: `<p>Colecciones derivadas del canon de Onoff mediante el selector del agregador de mocks; la grilla arma una fila por cada dos tarjetas desde viewport <code>sm</code>.</p><p>Las cuatro salen de la misma colección canónica, así que comparten portada, prosa y etiqueta: la grilla se ve más pareja de lo que se verá con contenido real, y no ejercita portadas dispares ni descripciones de largo distinto. Se corrige al ampliar el corpus con colecciones propias.</p><p><strong>Usos:</strong> la sección de colecciones de la página de inicio.</p>`,
			},
		},
	},
};

// El switch mueve el input real del componente, así que alcanza con una sola instancia: no hay markup
// duplicado que pueda divergir de lo que el componente dibuja.
export const Estados: Story = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `<cuentoneta-collection-teasers-deck ${argsToTemplate(args)} />`,
	}),
	args: {
		loading: true,
		teasers: deckTeasers,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Activá/desactivá "Cargando" para alternar entre el estado real y el de carga: encabezado fijo más un esqueleto por slot de la grilla. Vaciando además la lista aparece el tercer estado, el del aviso de vacío.',
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
					'Sin colecciones queda el encabezado y, en lugar de la grilla, el aviso de que no hay nada que mostrar: un hueco en blanco se leería como contenido que no terminó de cargar. Es el valor default del input teasers.',
			},
		},
	},
};

import { argsToTemplate, Meta, StoryObj } from '@storybook/angular-vite';

import { HighlightedAuthorsComponent } from './highlighted-authors.component';
import { onoffHighlightedAuthorsOfLength, onoffUntaggedHighlightedAuthor } from '@mocks/onoff-highlighted-authors.mock';
import { highlightedAuthorsDocs } from './highlighted-authors.component.docs';
import { authorTeaserCardDocs } from '../author-teaser-card/author-teaser-card.component.docs';
import { emptyStateDocs } from '../empty-state/empty-state.component.docs';
import { sectionHeaderDocs } from '../section-header/section-header.component.docs';
import { docsMention, docsRef } from '@testing/storybook-docs';
import type { AuthorTeaserCardSkeletonComponent } from '@components/author-teaser-card/author-teaser-card-skeleton.component';
import type { HighlightedAuthor } from '@models/landing-page-content.model';

// Los símbolos que la prosa de esta story nombra sin enlazar. La tupla no se usa en runtime:
// existe para que el import type-only rompa el `typecheck` si alguno deja de estar declarado.
export type DocsSymbols = [AuthorTeaserCardSkeletonComponent, HighlightedAuthor];

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
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El ${docsMention(highlightedAuthorsDocs)} es la sección de autores destacados de la página de inicio en el Design System v3: un ${docsRef(sectionHeaderDocs)} con el título "Autores/as destacados/as", su bajada y el enlace al índice de autores, más una grilla responsiva de una columna en mobile, dos desde <code>sm</code> y tres desde <code>lg</code>, con una vista previa por autor resuelta por ${docsRef(authorTeaserCardDocs)}.</p><p>Está tipado contra <strong>HighlightedAuthor</strong>, la proyección de curación semanal del contenido de la página de inicio, que compone el teaser del autor con las etiquetas de la tirada y su cantidad de obras. La curaduría y el tope de seis los decide el backend: el componente presenta lo que recibe, sin recortar ni ordenar. El estado de carga entra por input, porque el dueño del recurso es la página: cargando dibuja los skeletons de <strong>AuthorTeaserCardSkeletonComponent</strong>, con destacados la grilla, y sin destacados el aviso de ${docsRef(emptyStateDocs)}.</p></div>`,
			},
		},
	},
	argTypes: {
		authors: {
			control: { type: 'object' },
			description: 'Autores destacados de la semana; vacío deja solo el encabezado',
			table: { type: { summary: 'readonly HighlightedAuthor[]' }, defaultValue: { summary: '[]' } },
		},
		loading: {
			control: { type: 'boolean' },
			description: 'Estado de carga del recurso que alimenta la grilla; lo decide la página',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
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

// El switch mueve el input real del componente, así que alcanza con una sola instancia: no hay markup
// duplicado que pueda divergir de lo que el componente dibuja.
export const Estados: Story = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `<cuentoneta-highlighted-authors ${argsToTemplate(args)} />`,
	}),
	args: {
		loading: true,
		authors: highlightedAuthors,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Activá/desactivá "Cargando" para alternar entre el estado real y el de carga de la sección: encabezado fijo más la grilla llena de esqueletos. La cantidad es fija y no sigue a lo recibido, porque el esqueleto tiene que dibujar la sección completa aunque todavía no haya llegado ningún destacado. Vaciando además la lista aparece el tercer estado, el del aviso de vacío.<br><br><strong>Usos:</strong> la sección de autores destacados de la página de inicio, mientras resuelve el contenido de la semana.',
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
					'Sin destacados queda el encabezado con su enlace al índice de autores y, en lugar de la grilla, el aviso de que no hay nada que mostrar. Es el valor default del input authors, y el enlace sigue siendo navegable.<br><br><strong>Usos:</strong> la sección de autores destacados de la página de inicio, en una semana sin curaduría cargada.',
			},
		},
	},
};

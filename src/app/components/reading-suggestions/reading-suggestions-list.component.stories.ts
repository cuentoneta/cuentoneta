import { Meta, StoryObj } from '@storybook/angular-vite';

import { ReadingSuggestionsListComponent } from './reading-suggestions-list.component';
import { corpusLiteraryWorkTeasers } from '@mocks/onoff-corpus.storybook';
import type { NavigationContext } from '@app-utils/navigation-params';
import type { ReadingSuggestion } from './story-teaser-to-reading-suggestion.adapter';

const meta: Meta<ReadingSuggestionsListComponent> = {
	component: ReadingSuggestionsListComponent,
	title: 'Componentes V3/ReadingSuggestionsList',
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Bloque de sugerencias de lectura que cierra la lectura de una obra: un encabezado, una tríada de obras sugeridas y un acceso al listado completo. Reemplaza al rail lateral de navegación, cambiando la navegación in-situ por una invitación a seguir leyendo.</p><p>Es presentacional puro: recibe las obras ya resueltas mediante el input <code>teasers</code> y no conoce ningún provider. Quienes las consiguen son los envoltorios conectados <strong>AuthorReadingSuggestions</strong> (más obras del mismo autor) y <strong>CollectionReadingSuggestions</strong> (más obras de la misma colección), que elige <strong>ReadingSuggestions</strong> según el contexto de navegación. Esos tres no tienen catálogo propio: delegan acá toda su vista, así que lo que hay para evaluar visualmente se ve en esta story.</p><p>Cada sugerencia se renderiza con <a href="./?path=/docs/componentes-v3-literaryworkcardteaser--docs" target="_top"><strong>LiteraryWorkCardTeaser</strong></a> en su variante <code>OnGray</code>, separadas por divisores; el acceso al listado usa <a href="./?path=/docs/componentes-v3-button--docs" target="_top"><strong>Button</strong></a> en su variante <code>Outline</code>. Los controles <code>navigation</code> y <code>navigationSlug</code> son los query params que cada tarjeta arrastra a la obra destino: al cambiarlos se ve cómo se reescribe el <code>href</code> de cada enlace.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		heading: {
			control: { type: 'text' },
			description: 'Encabezado del bloque',
			table: { type: { summary: 'string' }, defaultValue: { summary: "''" } },
		},
		loading: {
			control: { type: 'boolean' },
			name: 'Cargando',
			description: 'Estado de carga: reemplaza encabezado, tarjetas y acceso por sus esqueletos',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
		moreLabel: {
			control: { type: 'text' },
			description: 'Texto del acceso al listado completo',
			table: { type: { summary: 'string' }, defaultValue: { summary: "''" } },
		},
		showAuthor: {
			control: { type: 'boolean' },
			description: 'Mostrar el autor de cada sugerencia (se oculta en la variante de autor, donde es redundante)',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
		// Las sugerencias las deriva el control de cantidad a partir del corpus, así que editarlas como
		// objeto no tendría efecto. Se saca el control y no la fila entera: el input sigue siendo el
		// principal del componente y su tipo pertenece a la documentación.
		teasers: {
			control: false,
			description:
				'Sugerencias ya resueltas: cada una lleva la obra y su extracto por separado. El bloque no se renderiza si llega vacío. En el catálogo las deriva el control de cantidad',
			table: { type: { summary: 'readonly ReadingSuggestion[]' }, defaultValue: { summary: '[]' } },
		},
		moreRoute: {
			control: { type: 'object' },
			description: 'Ruta del listado completo; sin ella el acceso no se muestra',
			table: { type: { summary: 'string | readonly string[]' }, defaultValue: { summary: 'undefined' } },
		},
		navigationParams: { table: { disable: true } },
	},
};

export default meta;

// El contexto de navegación se controla por sus dos partes y no como objeto: son los query params que
// cada tarjeta arrastra a la obra destino, y separarlos deja ver en el `href` cómo los cambia cada uno.
type Story = StoryObj<
	ReadingSuggestionsListComponent & { navigation: NavigationContext; navigationSlug: string; suggestionCount: number }
>;

const navigationArgTypes = {
	navigation: {
		control: { type: 'select' as const },
		options: ['author', 'collection'],
		name: 'navigation (query param)',
		description: 'Contexto con el que se llegó a la obra; viaja en el enlace de cada sugerencia',
		table: { type: { summary: "'author' | 'collection'" } },
	},
	navigationSlug: {
		control: { type: 'text' as const },
		name: 'navigationSlug (query param)',
		description: 'Slug del autor o de la colección de origen; acompaña al contexto en cada enlace',
		table: { type: { summary: 'string' } },
	},
};

// Las cuatro cantidades que el diseño enumera como variantes del bloque. Más de tres no es alcanzable
// en producción —el selector recorta a la cantidad acordada—, pero se ofrece igual: es lo que hace
// explícito que el intercalado del separador no está cableado a tres.
const suggestionCountArgType = {
	suggestionCount: {
		control: { type: 'inline-radio' as const },
		options: [1, 2, 3, 5],
		name: 'Cantidad de sugerencias',
		description: 'Cuántas obras trae el bloque. Los separadores son siempre uno menos',
		table: { type: { summary: 'number' }, defaultValue: { summary: '3' } },
		// El estado de carga reserva siempre la misma cantidad de slots, así que este control no lo
		// afecta: ofrecerlo ahí mentiría sobre lo que hace.
		if: { arg: 'loading', truthy: false },
	},
};

// El bloque recibe la obra y su extracto por separado. Estas stories muestran obras del canon, cuyo
// extracto ya viene en `teaserSection`, así que la lista de párrafos va vacía: la rama de Portable Text
// es la que alimenta el puente temporal desde `Story`.
const allSuggestions: ReadingSuggestion[] = corpusLiteraryWorkTeasers.map((literaryWork) => ({
	literaryWork,
	excerptParagraphs: [],
}));

// La cantidad se controla en vez de fijarse por entrada: lo que el diseño enumera como variantes del
// bloque es cuántas sugerencias trae, y el separador intercalado depende de eso.
const renderWithNavigation: Story['render'] = ({ navigation, navigationSlug, suggestionCount, ...args }) => ({
	props: {
		...args,
		teasers: allSuggestions.slice(0, suggestionCount),
		navigationParams: { navigation, navigationSlug },
	},
	template: `
		<cuentoneta-reading-suggestions-list
			[heading]="heading"
			[teasers]="teasers"
			[loading]="loading"
			[moreLabel]="moreLabel"
			[moreRoute]="moreRoute"
			[showAuthor]="showAuthor"
			[navigationParams]="navigationParams"
		/>
	`,
});

export const PorAutor: Story = {
	argTypes: { ...navigationArgTypes, ...suggestionCountArgType },
	render: renderWithNavigation,
	args: {
		heading: 'Más obras de François Onoff',
		suggestionCount: 3,
		moreLabel: 'Ver más de François Onoff',
		moreRoute: ['/', 'author', 'francois-onoff'],
		navigation: 'author',
		navigationSlug: 'francois-onoff',
		showAuthor: false,
		loading: false,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Variante de autor: el bloque ya está encabezado por el nombre del autor, así que las tarjetas ocultan avatar y nombre para no repetirlo. Activá <strong>Cargando</strong> para alternar entre el estado real y el esqueleto en el mismo slot.',
			},
		},
	},
};

export const PorColeccion: Story = {
	argTypes: { ...navigationArgTypes, ...suggestionCountArgType },
	render: renderWithNavigation,
	args: {
		heading: 'Más obras de Geometrías del desvelo',
		suggestionCount: 3,
		moreLabel: 'Ver más de Geometrías del desvelo',
		moreRoute: ['/', 'collection', 'geometrias-del-desvelo'],
		navigation: 'collection',
		navigationSlug: 'geometrias-del-desvelo',
		showAuthor: true,
		loading: false,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Variante de colección: una colección puede reunir obras de distintos autores, así que cada tarjeta muestra la suya. Activá <strong>Cargando</strong> para alternar entre el estado real y el esqueleto en el mismo slot.',
			},
		},
	},
};

import { applicationConfig, Meta, StoryObj } from '@storybook/angular-vite';
import { provideRouter } from '@angular/router';

import { ReadingSuggestionsListComponent } from './reading-suggestions-list.component';
import { corpusLiteraryWorkTeasers } from '@mocks/onoff-corpus.storybook';
import type { NavigationContext } from '@app-utils/navigation-params';
import type { ReadingSuggestion } from './story-teaser-to-reading-suggestion.adapter';

const meta: Meta<ReadingSuggestionsListComponent> = {
	component: ReadingSuggestionsListComponent,
	title: 'Componentes V3/ReadingSuggestionsList',
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
	],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Bloque de sugerencias de lectura que cierra la lectura de una obra: un encabezado, una tríada de obras sugeridas y un acceso al listado completo. Reemplaza al rail lateral de navegación, cambiando la navegación in-situ por una invitación a seguir leyendo.</p><p>Es presentacional puro: recibe las obras ya resueltas mediante el input <code>teasers</code> y no conoce ningún provider. Quienes las consiguen son los envoltorios conectados <strong>AuthorReadingSuggestions</strong> (más obras del mismo autor) y <strong>CollectionReadingSuggestions</strong> (más obras de la misma colección), que elige <strong>ReadingSuggestions</strong> según el contexto de navegación. Esos tres no tienen catálogo propio: no aportan presentación, y lo que hay para evaluar visualmente se ve acá.</p><p>Cada sugerencia se renderiza con <a href="./?path=/docs/componentes-v3-literaryworkcardteaser--docs" target="_top"><strong>LiteraryWorkCardTeaser</strong></a> en su variante <code>OnGray</code>, separadas por divisores; el acceso al listado usa <a href="./?path=/docs/componentes-v3-button--docs" target="_top"><strong>Button</strong></a> en su variante <code>Outline</code>. Los controles <code>navigation</code> y <code>navigationSlug</code> son los query params que cada tarjeta arrastra a la obra destino: al cambiarlos se ve cómo se reescribe el <code>href</code> de cada enlace.</p></div>`,
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
		teasers: {
			control: { type: 'object' },
			description:
				'Sugerencias ya resueltas: cada una lleva la obra y su extracto por separado. El bloque no se renderiza si llega vacío',
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
type Story = StoryObj<ReadingSuggestionsListComponent & { navigation: NavigationContext; navigationSlug: string }>;

const navigationArgTypes = {
	navigation: {
		control: { type: 'select' as const },
		options: ['author', 'storylist'],
		name: 'navigation (query param)',
		description: 'Contexto con el que se llegó a la obra; viaja en el enlace de cada sugerencia',
		table: { type: { summary: "'author' | 'storylist'" } },
	},
	navigationSlug: {
		control: { type: 'text' as const },
		name: 'navigationSlug (query param)',
		description: 'Slug del autor o de la colección de origen; acompaña al contexto en cada enlace',
		table: { type: { summary: 'string' } },
	},
};

// El bloque recibe la obra y su extracto por separado. Estas stories muestran obras del canon, cuyo
// extracto ya viene en `teaserSection`, así que la lista de párrafos va vacía: la rama de Portable Text
// es la que alimenta el puente temporal desde `Story`.
const suggestions: ReadingSuggestion[] = corpusLiteraryWorkTeasers
	.slice(0, 3)
	.map((literaryWork) => ({ literaryWork, excerptParagraphs: [] }));

const renderWithNavigation: Story['render'] = ({ navigation, navigationSlug, ...args }) => ({
	props: { ...args, navigationParams: { navigation, navigationSlug } },
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
	argTypes: navigationArgTypes,
	render: renderWithNavigation,
	args: {
		heading: 'Más obras de François Onoff',
		teasers: suggestions,
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
	argTypes: navigationArgTypes,
	render: renderWithNavigation,
	args: {
		heading: 'Más obras de Geometrías del desvelo',
		teasers: suggestions,
		moreLabel: 'Ver más de Geometrías del desvelo',
		moreRoute: ['/', 'storylist', 'geometrias-del-desvelo'],
		navigation: 'storylist',
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

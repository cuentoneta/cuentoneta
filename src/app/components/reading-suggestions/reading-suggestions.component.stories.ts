import { applicationConfig, Meta, StoryObj } from '@storybook/angular-vite';
import { provideRouter } from '@angular/router';

import { ReadingSuggestionsComponent } from './reading-suggestions.component';
import { corpusLiteraryWorkTeasers } from '@mocks/onoff-corpus.storybook';

const meta: Meta<ReadingSuggestionsComponent> = {
	component: ReadingSuggestionsComponent,
	title: 'Componentes V3/ReadingSuggestions',
	tags: ['autodocs'],
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
	],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Bloque de sugerencias de lectura que cierra la lectura de una obra: un encabezado, una tríada de obras sugeridas y un acceso al listado completo. Reemplaza al rail lateral de navegación, cambiando la navegación in-situ por una invitación a seguir leyendo.</p><p>Es presentacional puro: recibe las obras ya resueltas mediante el input <code>teasers</code> y no conoce ningún provider. Quienes las consiguen son sus dos envoltorios conectados, <a href="./?path=/docs/componentes-v3-authorreadingsuggestions--docs" target="_top"><strong>AuthorReadingSuggestions</strong></a> (más obras del mismo autor) y <a href="./?path=/docs/componentes-v3-collectionreadingsuggestions--docs" target="_top"><strong>CollectionReadingSuggestions</strong></a> (más obras de la misma colección).</p><p>Cada sugerencia se renderiza con <a href="./?path=/docs/componentes-v3-literaryworkcardteaser--docs" target="_top"><strong>LiteraryWorkCardTeaser</strong></a> en su variante <code>OnGray</code>, separadas por divisores; el acceso al listado usa <a href="./?path=/docs/componentes-v3-button--docs" target="_top"><strong>Button</strong></a> en su variante <code>Outline</code>.</p></div>`,
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
		tagLabel: {
			control: { type: 'text' },
			description: 'Etiqueta opcional que cada tarjeta muestra antes del tiempo de lectura',
			table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
		},
		teasers: {
			control: { type: 'object' },
			description: 'Obras ya resueltas que se sugieren; el bloque no se renderiza si llega vacío',
			table: { type: { summary: 'readonly LiteraryWorkCardTeaserContent[]' }, defaultValue: { summary: '[]' } },
		},
		moreRoute: {
			control: { type: 'object' },
			description: 'Ruta del listado completo; sin ella el acceso no se muestra',
			table: { type: { summary: 'string | readonly string[]' }, defaultValue: { summary: 'undefined' } },
		},
		navigationParams: {
			control: { type: 'object' },
			description: 'Contexto de navegación que arrastra el enlace de cada sugerencia a la obra destino',
			table: { type: { summary: 'NavigationParams' }, defaultValue: { summary: 'undefined' } },
		},
	},
};

export default meta;
type Story = StoryObj<ReadingSuggestionsComponent>;

const suggestions = corpusLiteraryWorkTeasers.slice(0, 3);

export const PorAutor: Story = {
	args: {
		heading: 'Más obras de François Onoff',
		teasers: suggestions,
		moreLabel: 'Ver más de François Onoff',
		moreRoute: ['/', 'author', 'francois-onoff'],
		navigationParams: { navigation: 'author', navigationSlug: 'francois-onoff' },
		showAuthor: false,
		tagLabel: 'Cuento',
	},
	parameters: {
		docs: {
			description: {
				story:
					'Variante de autor: el bloque ya está encabezado por el nombre del autor, así que las tarjetas ocultan avatar y nombre para no repetirlo.',
			},
		},
	},
};

export const PorColeccion: Story = {
	args: {
		heading: 'Más obras de Geometrías del desvelo',
		teasers: suggestions,
		moreLabel: 'Ver más de Geometrías del desvelo',
		moreRoute: ['/', 'storylist', 'geometrias-del-desvelo'],
		navigationParams: { navigation: 'storylist', navigationSlug: 'geometrias-del-desvelo' },
		showAuthor: true,
		tagLabel: 'Cuento',
	},
	parameters: {
		docs: {
			description: {
				story:
					'Variante de colección: una colección puede reunir obras de distintos autores, así que cada tarjeta muestra la suya.',
			},
		},
	},
};

export const Estados: StoryObj<ReadingSuggestionsComponent & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	args: {
		loading: true,
		heading: 'Más obras de François Onoff',
		teasers: suggestions,
		moreLabel: 'Ver más de François Onoff',
		moreRoute: ['/', 'author', 'francois-onoff'],
		showAuthor: true,
		tagLabel: 'Cuento',
	},
	parameters: {
		docs: {
			description: {
				story:
					'Activá/desactivá "Cargando" para alternar entre el estado real y el esqueleto en el mismo slot, y verificar la alineación entre ambos.',
			},
		},
	},
};

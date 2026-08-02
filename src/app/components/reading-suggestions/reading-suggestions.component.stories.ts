import { applicationConfig, argsToTemplate, Meta, StoryObj } from '@storybook/angular-vite';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ReadingSuggestionsComponent } from './reading-suggestions.component';
import { StoryApi } from '../../providers/story-api.interface';
import { StorylistApi } from '../../providers/storylist-api.interface';
import { storylistNavigationTeaserMock } from '@mocks/storylist.mock';
import { corpusStoryNavigationTeasers, corpusStoryNavigationTeasersWithAuthor } from '@mocks/onoff-corpus.storybook';
import { authorTeaserMock } from '@mocks/author.mock';

const collectionMock = { ...storylistNavigationTeaserMock, stories: corpusStoryNavigationTeasersWithAuthor };

const meta: Meta<ReadingSuggestionsComponent> = {
	component: ReadingSuggestionsComponent,
	title: 'Componentes V3/ReadingSuggestions',
	tags: ['autodocs'],
	decorators: [
		applicationConfig({
			providers: [
				provideRouter([]),
				{
					provide: StoryApi,
					useValue: { getNavigationTeasersByAuthorSlug: () => of(corpusStoryNavigationTeasers) },
				},
				{ provide: StorylistApi, useValue: { getStorylistNavigationTeasers: () => of(collectionMock) } },
			],
		}),
	],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Punto de entrada único del bloque de sugerencias que cierra la lectura de una obra. Quien lo consume no conoce las variantes: solo le pasa el contexto de navegación con el que se llegó a la obra, y el componente elige entre <a href="./?path=/docs/componentes-v3-authorreadingsuggestions--docs" target="_top"><strong>AuthorReadingSuggestions</strong></a> (más obras del mismo autor) y <a href="./?path=/docs/componentes-v3-collectionreadingsuggestions--docs" target="_top"><strong>CollectionReadingSuggestions</strong></a> (más obras de la misma colección). Ambas presentan sus obras con <a href="./?path=/docs/componentes-v3-readingsuggestionslist--docs" target="_top"><strong>ReadingSuggestionsList</strong></a>.</p><p>Cada variante vive en su propio bloque <code>&#64;defer (on viewport)</code>, así se descarga el bundle de la que se va a usar y no el de la otra. El diferido cumple además un segundo propósito: en el renderizado del servidor se sirve el marcador de posición, sin instanciar la variante ni pedir datos, de modo que el bloque resuelve con una sola consulta y ya en el cliente, al acercarse el final de la lectura.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		navigationParams: {
			control: { type: 'object' },
			description: 'Contexto con el que se llegó a la obra; elige la variante y le da el slug por el que consultar',
			table: { type: { summary: 'NavigationParams' } },
		},
		authorName: {
			control: { type: 'text' },
			description: 'Nombre del autor, que la variante de autor usa en su encabezado',
			table: { type: { summary: 'string' }, defaultValue: { summary: "''" } },
		},
		currentWorkSlug: {
			control: { type: 'text' },
			description: 'Obra en lectura, que queda excluida de las sugerencias',
			table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
		},
	},
};

export default meta;
type Story = StoryObj<ReadingSuggestionsComponent>;

export const PorAutor: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-reading-suggestions ${argsToTemplate(args)} />`,
	}),
	args: {
		navigationParams: { navigation: 'author', navigationSlug: authorTeaserMock.slug },
		authorName: authorTeaserMock.name,
		currentWorkSlug: corpusStoryNavigationTeasers[0].slug,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Con el contexto de autor se monta la variante de autor, y el bundle de la de colección no se descarga. Cambiá <strong>navigationParams.navigation</strong> a <code>storylist</code> para ver la otra rama.',
			},
		},
	},
};

export const PorColeccion: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-reading-suggestions ${argsToTemplate(args)} />`,
	}),
	args: {
		navigationParams: { navigation: 'storylist', navigationSlug: collectionMock.slug },
		authorName: authorTeaserMock.name,
		currentWorkSlug: collectionMock.stories[0].slug,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Con el contexto de colección se monta la variante de colección, que además muestra el autor de cada obra porque una colección puede reunir obras de varios.',
			},
		},
	},
};

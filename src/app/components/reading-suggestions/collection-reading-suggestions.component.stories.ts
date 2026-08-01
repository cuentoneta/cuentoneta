import { applicationConfig, argsToTemplate, Meta, StoryObj } from '@storybook/angular-vite';
import { provideRouter } from '@angular/router';
import { NEVER, of } from 'rxjs';

import { CollectionReadingSuggestionsComponent } from './collection-reading-suggestions.component';
import { StorylistApi } from '../../providers/storylist-api.interface';
import type { StorylistStoriesNavigationTeasers } from '@models/storylist.model';
import { storylistNavigationTeaserMock } from '@mocks/storylist.mock';
import { onoffStoryNavigationTeasersWithAuthorMock } from '@mocks/onoff-story-teasers.mock';

const collectionMock: StorylistStoriesNavigationTeasers = {
	...storylistNavigationTeaserMock,
	stories: onoffStoryNavigationTeasersWithAuthorMock,
};

const meta: Meta<CollectionReadingSuggestionsComponent> = {
	component: CollectionReadingSuggestionsComponent,
	title: 'Componentes V3/CollectionReadingSuggestions',
	tags: ['autodocs'],
	decorators: [
		applicationConfig({
			providers: [
				provideRouter([]),
				{ provide: StorylistApi, useValue: { getStorylistNavigationTeasers: () => of(collectionMock) } },
			],
		}),
	],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Envoltorio conectado que sugiere otras obras de la misma colección al pie de la lectura. Resuelve la colección contra el proveedor de datos, descarta la obra que se está leyendo, elige tres al azar y delega toda la presentación en <a href="./?path=/docs/componentes-v3-readingsuggestionslist--docs" target="_top"><strong>ReadingSuggestionsList</strong></a>.</p><p>A diferencia de <a href="./?path=/docs/componentes-v3-authorreadingsuggestions--docs" target="_top"><strong>AuthorReadingSuggestions</strong></a>, cada tarjeta muestra su autor: una colección puede reunir obras de varios. El encabezado y el acceso al listado se arman con el título de la colección, que llega con los datos.</p><p>El fetch no bloquea el renderizado en el servidor: la página que lo consume monta el bloque dentro de un <code>&#64;defer (on viewport)</code>, así los datos se piden una sola vez y ya en el cliente, al acercarse el final de la lectura.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		collectionSlug: {
			control: { type: 'text' },
			description: 'Slug de la colección cuyas obras se sugieren',
			table: { type: { summary: 'string' } },
		},
		currentWorkSlug: {
			control: { type: 'text' },
			description: 'Slug de la obra en lectura, que queda excluida de las sugerencias',
			table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
		},
	},
};

export default meta;
type Story = StoryObj<CollectionReadingSuggestionsComponent>;

export const Interactiva: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-collection-reading-suggestions ${argsToTemplate(args)} />`,
	}),
	args: {
		collectionSlug: collectionMock.slug,
		currentWorkSlug: collectionMock.stories[0].slug,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Las obras salen del corpus de François Onoff. Cambiá <strong>currentWorkSlug</strong> para ver cómo la obra en lectura queda fuera de las sugerencias.',
			},
		},
	},
};

export const Cargando: Story = {
	decorators: [
		applicationConfig({
			// Un stream que nunca emite deja el bloque en su estado de carga.
			providers: [{ provide: StorylistApi, useValue: { getStorylistNavigationTeasers: () => NEVER } }],
		}),
	],
	render: (args) => ({
		props: args,
		template: `<cuentoneta-collection-reading-suggestions ${argsToTemplate(args)} />`,
	}),
	args: {
		collectionSlug: collectionMock.slug,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Estado de carga del envoltorio, mientras la colección viaja. El alternador real↔esqueleto vive en la story <strong>Estados</strong> de <a href="./?path=/docs/componentes-v3-readingsuggestionslist--docs" target="_top"><strong>ReadingSuggestionsList</strong></a>, que es quien renderiza ambos estados.',
			},
		},
	},
};

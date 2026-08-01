import { applicationConfig, argsToTemplate, Meta, StoryObj } from '@storybook/angular-vite';
import { provideRouter } from '@angular/router';
import { NEVER, of } from 'rxjs';

import { AuthorReadingSuggestionsComponent } from './author-reading-suggestions.component';
import { StoryApi } from '../../providers/story-api.interface';
import { onoffStoryNavigationTeasersMock } from '@mocks/onoff-story-teasers.mock';
import { authorTeaserMock } from '@mocks/author.mock';

const meta: Meta<AuthorReadingSuggestionsComponent> = {
	component: AuthorReadingSuggestionsComponent,
	title: 'Componentes V3/AuthorReadingSuggestions',
	tags: ['autodocs'],
	decorators: [
		applicationConfig({
			providers: [
				provideRouter([]),
				{
					provide: StoryApi,
					useValue: { getNavigationTeasersByAuthorSlug: () => of(onoffStoryNavigationTeasersMock) },
				},
			],
		}),
	],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Envoltorio conectado que sugiere otras obras del mismo autor al pie de la lectura. Resuelve las obras contra el proveedor de datos, descarta la que se está leyendo, elige tres al azar y delega toda la presentación en <a href="./?path=/docs/componentes-v3-readingsuggestions--docs" target="_top"><strong>ReadingSuggestions</strong></a>.</p><p>Las tarjetas ocultan avatar y nombre del autor: el encabezado del bloque ya lo nombra. El azar se resuelve una sola vez por consulta, al resolverse los datos, para que las sugerencias no se rebarajen mientras la persona lee.</p><p>El fetch no bloquea el renderizado en el servidor: la página que lo consume monta el bloque dentro de un <code>&#64;defer (on viewport)</code>, así los datos se piden una sola vez y ya en el cliente, al acercarse el final de la lectura.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		authorSlug: {
			control: { type: 'text' },
			description: 'Slug del autor cuyas obras se sugieren',
			table: { type: { summary: 'string' } },
		},
		authorName: {
			control: { type: 'text' },
			description: 'Nombre del autor, con el que se arman el encabezado y el acceso al listado',
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
type Story = StoryObj<AuthorReadingSuggestionsComponent>;

export const Interactiva: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-author-reading-suggestions ${argsToTemplate(args)} />`,
	}),
	args: {
		authorSlug: authorTeaserMock.slug,
		authorName: authorTeaserMock.name,
		currentWorkSlug: onoffStoryNavigationTeasersMock[0].slug,
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
			providers: [{ provide: StoryApi, useValue: { getNavigationTeasersByAuthorSlug: () => NEVER } }],
		}),
	],
	render: (args) => ({
		props: args,
		template: `<cuentoneta-author-reading-suggestions ${argsToTemplate(args)} />`,
	}),
	args: {
		authorSlug: authorTeaserMock.slug,
		authorName: authorTeaserMock.name,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Estado de carga del envoltorio, mientras las obras del autor viajan. El alternador real↔esqueleto vive en la story <strong>Estados</strong> de <a href="./?path=/docs/componentes-v3-readingsuggestions--docs" target="_top"><strong>ReadingSuggestions</strong></a>, que es quien renderiza ambos estados.',
			},
		},
	},
};

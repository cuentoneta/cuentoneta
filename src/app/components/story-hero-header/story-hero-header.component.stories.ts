import { applicationConfig, argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';

import { StoryHeroHeaderComponent } from './story-hero-header.component';
import { onoffStoriesMock } from '../../mocks/onoff-stories.mock';
import { palacioNueveFronterasStoryMock } from '../../mocks/onoff/el-palacio-de-las-nueve-fronteras.mock';
import { literaryWorkSelectArgType } from '../../mocks/onoff-corpus.storybook';

const meta: Meta<StoryHeroHeaderComponent> = {
	component: StoryHeroHeaderComponent,
	title: 'Componentes V3/StoryHeroHeader',
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
				component: `<div><p>Banda superior (hero) de la página de una historia. Usa la misma portada del cuento como fondo difuminado con una capa de opacidad y, en primer plano, presenta la portada nítida, el tipo literario, el autor, el título y la colección/año de publicación originales.</p><p>Recibe el <code>Story</code> completo como único input; cuando no se provee, renderiza su propio estado de carga (skeleton).</p><p>Se compone de <a href="./?path=/docs/componentes-v3-coverimage--docs" target="_top"><strong>CoverImage</strong></a> (portada en primer plano), <a href="./?path=/docs/componentes-v3-tag--docs" target="_top"><strong>Tag</strong></a> (tipo literario, variante <code>gray</code>) e <a href="./?path=/docs/componentes-v3-imageprofile--docs" target="_top"><strong>ImageProfile</strong></a> (avatar del autor).</p></div>`,
			},
		},
		layout: 'fullscreen',
	},
	argTypes: {
		story: {
			control: { type: 'object' },
			description:
				'Historia completa a partir de la cual se derivan portada, tipo literario, autor, título y publicación',
			table: { type: { summary: 'Story' }, defaultValue: { summary: 'undefined' } },
		},
	},
};

export default meta;
type Story = StoryObj<StoryHeroHeaderComponent>;

export const Interactiva: StoryObj<StoryHeroHeaderComponent & { storyIndex: number }> = {
	argTypes: {
		storyIndex: {
			...literaryWorkSelectArgType,
			description:
				'Obra del corpus de François Onoff; su portada, título, autor y publicación cambian de forma conjunta',
		},
	},
	render: (args) => ({
		props: { ...args, stories: onoffStoriesMock },
		template: `<cuentoneta-story-hero-header [story]="stories[storyIndex]" />`,
	}),
	args: { storyIndex: 0 },
	parameters: {
		docs: {
			description: {
				story:
					'Playground interactivo. Elegí la <strong>Obra</strong> del corpus: su portada de fondo, título, autor y publicación cambian de forma conjunta.',
			},
		},
	},
};

export const Default: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-story-hero-header ${argsToTemplate(args)} />`,
	}),
	args: { story: palacioNueveFronterasStoryMock },
	parameters: {
		docs: {
			description: {
				story: 'Estado principal del hero con portada, tipo literario, autor, título y publicación.',
			},
		},
	},
};

export const SinGenero: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-story-hero-header ${argsToTemplate(args)} />`,
	}),
	args: { story: { ...palacioNueveFronterasStoryMock, tags: [] } },
	parameters: {
		docs: {
			description: {
				story: 'Cuando la historia no tiene tags, el Tag de tipo literario se omite y el resto del bloque se mantiene.',
			},
		},
	},
};

// El hero renderiza su propio skeleton cuando no recibe story, así que basta una única instancia.
export const Estados: StoryObj<StoryHeroHeaderComponent & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `<cuentoneta-story-hero-header [story]="loading ? undefined : story" />`,
	}),
	args: { loading: true, story: palacioNueveFronterasStoryMock },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

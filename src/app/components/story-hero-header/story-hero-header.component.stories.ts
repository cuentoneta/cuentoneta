import { applicationConfig, argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';

import type { Story as StoryModel } from '@models/story.model';
import type { Tag } from '@models/tag.model';
import { StoryHeroHeaderComponent } from './story-hero-header.component';
import { onoffStoriesMock } from '../../mocks/onoff-stories.mock';
import { palacioNueveFronterasStoryMock } from '../../mocks/onoff/el-palacio-de-las-nueve-fronteras.mock';
import { literaryWorkSelectArgType } from '../../mocks/onoff-corpus.storybook';

// Género de muestra: los mocks del corpus Onoff traen `tags: []` (deuda de #1593), así que se superpone
// un tag localmente —sin tocar los mocks compartidos— para poder visualizar el Tag de género del hero.
const genreTag: Tag = { title: 'Ciencia ficción', slug: 'ciencia-ficcion', shortDescription: '', description: [] };
const withGenre = (story: StoryModel): StoryModel => ({ ...story, tags: [genreTag] });

// Las descripciones de la doc van en una sola línea: el renderer de Markdown de los autodocs
// interpreta como bloque de código cualquier línea con indentación, así que un HTML multilínea
// indentado se mostraría dentro de un recuadro de código.
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
				component: `<div><p>Banda superior (hero) de la página de una historia. Usa la misma portada del cuento como fondo difuminado con una capa de opacidad y, en primer plano, presenta la portada nítida, el género, el autor, el título y la colección/año de publicación originales.</p><p>Recibe el <code>Story</code> completo como único input; cuando no se provee, renderiza su propio estado de carga (skeleton).</p><p>Se compone de <a href="./?path=/docs/componentes-v3-coverimage--docs" target="_top"><strong>CoverImage</strong></a> (portada en primer plano), <a href="./?path=/docs/componentes-v3-tag--docs" target="_top"><strong>Tag</strong></a> (género, variante <code>gray</code>) e <a href="./?path=/docs/componentes-v3-imageprofile--docs" target="_top"><strong>ImageProfile</strong></a> (avatar del autor).</p></div>`,
			},
		},
		layout: 'fullscreen',
	},
	argTypes: {
		story: {
			control: { type: 'object' },
			description: 'Historia completa a partir de la cual se derivan portada, género, autor, título y publicación',
			table: { type: { summary: 'Story' }, defaultValue: { summary: 'undefined' } },
		},
	},
};

export default meta;
type Story = StoryObj<StoryHeroHeaderComponent>;

// Playground interactivo: un único selector de Obra; portada de fondo, título, autor y publicación cambian juntos.
export const Interactiva: StoryObj<StoryHeroHeaderComponent & { storyIndex: number }> = {
	argTypes: {
		storyIndex: {
			...literaryWorkSelectArgType,
			description:
				'Obra del corpus de François Onoff; su portada, título, autor y publicación cambian de forma conjunta',
		},
	},
	render: (args) => ({
		props: { ...args, stories: onoffStoriesMock.map(withGenre) },
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

// Estado principal documentado: un cuento fijo del corpus con género.
export const Default: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-story-hero-header ${argsToTemplate(args)} />`,
	}),
	args: { story: withGenre(palacioNueveFronterasStoryMock) },
	parameters: {
		docs: {
			description: {
				story: 'Estado principal del hero con portada, género, autor, título y publicación.',
			},
		},
	},
};

// Sin género: el estado real de los mocks base (`tags: []`); el Tag se oculta sin romper el layout.
export const SinGenero: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-story-hero-header ${argsToTemplate(args)} />`,
	}),
	args: { story: palacioNueveFronterasStoryMock },
	parameters: {
		docs: {
			description: {
				story: 'Cuando la historia no tiene tags, el Tag de género se omite y el resto del bloque se mantiene.',
			},
		},
	},
};

// Switch "Cargando" para alternar real↔skeleton en el mismo slot y evaluar la transición/alineación.
// El hero renderiza su propio skeleton cuando no recibe story.
export const Estados: StoryObj<StoryHeroHeaderComponent & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			@if (loading) {
				<cuentoneta-story-hero-header />
			} @else {
				<cuentoneta-story-hero-header [story]="story" />
			}
		`,
	}),
	args: { loading: true, story: withGenre(palacioNueveFronterasStoryMock) },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

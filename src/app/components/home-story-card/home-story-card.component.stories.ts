import { applicationConfig, argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';

import { HomeStoryCardComponent } from './home-story-card.component';
import { HomeStoryCardSkeletonComponent } from './home-story-card-skeleton.component';
import { storyTeaserMock } from '../../mocks/story.mock';
import { authorTeaserMock } from '../../mocks/author.mock';
import type { StoryTeaserWithAuthor } from '@models/story.model';
import type { Media } from '@models/media.model';

// Conjunto de medios variado para ilustrar los selectores de multimedia y el contador (badge):
// 3 videos de YouTube (muestra el contador), un Space de X y un episodio de Spotify.
const richMedia: Media[] = [
	{ title: 'Video 1', type: 'youTubeVideo', description: [], data: { videoId: 'a' } },
	{ title: 'Video 2', type: 'youTubeVideo', description: [], data: { videoId: 'b' } },
	{ title: 'Video 3', type: 'youTubeVideo', description: [], data: { videoId: 'c' } },
	{
		title: 'Space',
		type: 'spaceRecording',
		description: [],
		data: { url: null, duration: '', hostName: '', date: '' },
	},
	{ title: 'Podcast', type: 'spotifyPodcastEpisode', description: [], data: { url: 'https://spotify.com' } },
];

const storyMock: StoryTeaserWithAuthor = {
	...storyTeaserMock,
	author: authorTeaserMock,
	media: richMedia,
};

const meta: Meta<HomeStoryCardComponent> = {
	component: HomeStoryCardComponent,
	title: 'Componentes V3/HomeStoryCard',
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
	],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div>
					<p>El componente **HomeStoryCardComponent** es la tarjeta de vista previa de una historia para la home,
					basada en el Design System v3. Derivada de StoryCardTeaserV3, presenta un layout vertical angosto con la
					imagen, la numeración y los selectores de multimedia apilados sobre un contenedor gris.</p>
					<ul>
						<li>El título de la historia se trunca siempre a una sola línea.</li>
						<li>Los selectores de multimedia usan siempre el tema <code>solid</code> (recuadros blancos sobre el gris).</li>
						<li>El autor (avatar + nombre) se muestra siempre; el único enlace accesible es el de la historia.</li>
					</ul>
				</div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		order: {
			control: { type: 'number', min: 1, max: 99 },
			description: 'Numeración opcional de la historia',
			table: { type: { summary: 'number' }, defaultValue: { summary: 'undefined' } },
		},
		coverImageUrl: {
			control: { type: 'text' },
			description:
				'URL de la imagen alusiva a la historia (si no se provee, se muestra el placeholder del Design System)',
			table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
		},
		tagLabel: {
			control: { type: 'text' },
			description: 'Etiqueta opcional que se muestra antes del tiempo de lectura',
			table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
		},
		showMultimedia: {
			control: { type: 'boolean' },
			description: 'Mostrar los selectores de multimedia asociados a la historia',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
		navigationParams: {
			control: { type: 'object' },
			description: 'Parámetros de navegación para el contexto de enrutamiento',
			table: {
				type: { summary: '{ navigation: string; navigationSlug: string }' },
				defaultValue: { summary: 'undefined' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<HomeStoryCardComponent>;

// Playground interactivo. Sin coverImageUrl: se muestra el placeholder del Design System.
export const Docs: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-home-story-card ${argsToTemplate(args)} />`,
	}),
	args: {
		story: storyMock,
		order: 1,
		tagLabel: 'Cuento',
		showMultimedia: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Playground interactivo. Usá los controles de abajo para alternar los inputs del componente.',
			},
		},
	},
};

// Tarjeta completa: cover sobre contenedor gris, numeración, multimedia, autor y título.
export const Default: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-home-story-card ${argsToTemplate(args)} />`,
	}),
	args: {
		story: storyMock,
		order: 1,
		tagLabel: 'Cuento',
		showMultimedia: true,
	},
	parameters: {
		docs: {
			description: {
				story: 'Tarjeta de home con numeración, selectores de multimedia, autor y título truncado a una línea.',
			},
		},
	},
};

// Estado de carga (skeleton) de la tarjeta.
export const Skeleton: StoryObj = {
	decorators: [moduleMetadata({ imports: [HomeStoryCardSkeletonComponent] })],
	render: () => ({ template: `<cuentoneta-home-story-card-skeleton />` }),
	parameters: {
		docs: { description: { story: 'Skeleton de carga de la tarjeta.' } },
	},
};

// Switch "Cargando" para alternar real↔skeleton en el mismo slot y evaluar la transición/alineación.
// La tarjeta renderiza su propio skeleton cuando no recibe story.
export const Estados: StoryObj<HomeStoryCardComponent & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			<div class="w-[331px]">
				@if (loading) {
					<cuentoneta-home-story-card />
				} @else {
					<cuentoneta-home-story-card
						[story]="story"
						[order]="order"
						[tagLabel]="tagLabel"
						[showMultimedia]="showMultimedia"
					/>
				}
			</div>
		`,
	}),
	args: { loading: true, story: storyMock, order: 1, tagLabel: 'Cuento', showMultimedia: true },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

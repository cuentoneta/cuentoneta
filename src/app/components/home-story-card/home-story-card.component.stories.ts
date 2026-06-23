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

// Las descripciones de la doc van en una sola línea: el renderer de Markdown de los autodocs
// interpreta como bloque de código cualquier línea con indentación, así que un HTML multilínea
// indentado se mostraría dentro de un recuadro de código.
const meta: Meta<HomeStoryCardComponent> = {
	component: HomeStoryCardComponent,
	title: 'Componentes V3/HomeStoryCard',
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
				component: `<div><p>Utilizado para representar una vista previa de una historia en la Home. Resume la información principal del contenido, incluyendo autor, título, categoría, tiempo estimado de lectura, imagen asociada y accesos a archivos multimediales como video, X o Spotify.</p><p>Su objetivo es facilitar un vistazo rápido del contenido disponible y ayudar al usuario a decidir si quiere profundizar en la historia.</p><p>Derivada de <a href="./?path=/docs/componentes-v3-storycardteaserv3--docs" target="_top"><strong>StoryCardTeaserV3</strong></a>, presenta un layout vertical angosto con la imagen, la numeración y los selectores de multimedia apilados sobre un contenedor gris.</p><ul><li>El título de la historia se trunca siempre a una sola línea.</li><li>Los selectores de multimedia usan siempre la variante <code>Filled</code> del MediaTag (recuadros blancos sobre el gris).</li><li>El avatar y el nombre del autor son elementos clickeables que enlazan al perfil del autor; en estado hover, el nombre se subraya.</li></ul></div>`,
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
				story: `<p>Variante Default: tarjeta de home con el cover, la numeración y los selectores de multimedia apilados sobre el contenedor gris, más el autor y el título. Cuando la historia contenga un archivo multimedial para ser reproducido se va a visualizar con un MediaTag, y este deberá utilizarse siempre en su variante <code>Filled</code>.</p><p><strong>Comportamiento:</strong></p><ul><li>El título se trunca a un máximo de 1 línea.</li><li>El avatar y el nombre del autor son elementos clickeables. En estado hover, el nombre se subraya para reforzar la affordance de enlace y permitir el acceso directo al perfil del autor y debe aplicarse únicamente sobre los elementos vinculados al autor, sin afectar el resto del contenido de la card.</li></ul><p><strong>Usos:</strong> Home.</p>`,
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

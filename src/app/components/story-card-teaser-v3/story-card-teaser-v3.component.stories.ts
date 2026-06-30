import { applicationConfig, argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';

import { StoryCardTeaserV3Component } from './story-card-teaser-v3.component';
import {
	elOdioTeaserMock,
	geometriaTeaserMock,
	onoffStoryTeasersMock,
	palacioNueveFronterasTeaserMock,
} from '../../mocks/onoff-story-teasers.mock';
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

// Los teasers del corpus tienen media: []; se les compone richMedia para ilustrar los selectores de multimedia.
const withMedia = (teaser: StoryTeaserWithAuthor): StoryTeaserWithAuthor => ({ ...teaser, media: richMedia });

// Las portadas se derivan del coverImage de cada teaser; los tres arrays comparten el índice del corpus.
const corpusStories = onoffStoryTeasersMock.map(withMedia);
const corpusCovers = onoffStoryTeasersMock.map((teaser) => teaser.coverImage);
const corpusLabels = Object.fromEntries(onoffStoryTeasersMock.map((teaser, index) => [index, teaser.title]));

// Las descripciones de la doc van en una sola línea: el renderer de Markdown de los autodocs
// interpreta como bloque de código cualquier línea con indentación, así que un HTML multilínea
// indentado se mostraría dentro de un recuadro de código.
const meta: Meta<StoryCardTeaserV3Component> = {
	component: StoryCardTeaserV3Component,
	title: 'Componentes V3/StoryCardTeaserV3',
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
				component: `<div><p>Utilizado para representar una vista previa de una historia dentro de listados o secciones de exploración. Resume la información principal del contenido, incluyendo autor, título, texto truncado, categoría, tiempo estimado de lectura, imagen asociada y accesos a archivos multimediales como video, X o Spotify.</p><p>Su objetivo es facilitar una lectura rápida del contenido disponible y ayudar al usuario a decidir si quiere profundizar en la historia. Puede adaptarse a distintas estructuras visuales según el contexto de uso, manteniendo consistencia en la jerarquía de información y en las acciones disponibles.</p><p>Se implementa en tres variantes seleccionables mediante el input <code>variant</code>:</p><ul><li><strong>OnWhite</strong> (<code>on-white</code>): layout horizontal con imagen a la izquierda, para fondos blancos.</li><li><strong>OnGray</strong> (<code>on-gray</code>): igual a OnWhite con selectores de multimedia en blanco, para fondos grises.</li><li><strong>Highlighted</strong> (<code>highlighted</code>): tarjeta destacada con borde, fondo e imagen a la derecha.</li></ul><p>Cada variante admite mostrar opcionalmente autor, descripción, numeración, etiqueta y selectores de multimedia.</p><p>Se compone de <a href="./?path=/docs/componentes-v3-coverimage--docs" target="_top"><strong>CoverImage</strong></a> (portada), <a href="./?path=/docs/componentes-v3-imageprofile--docs" target="_top"><strong>ImageProfile</strong></a> (avatar del autor) y <a href="./?path=/docs/componentes-v3-storymediaselectors--docs" target="_top"><strong>StoryMediaSelectors</strong></a> (accesos multimedia); el extracto se renderiza con <strong>PortableTextParser</strong>.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		variant: {
			control: { type: 'select' },
			options: ['on-white', 'on-gray', 'highlighted'],
			description: 'Variante visual del componente',
			table: {
				type: { summary: "'on-white' | 'on-gray' | 'highlighted'" },
				defaultValue: { summary: 'on-white' },
			},
		},
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
		showAuthor: {
			control: { type: 'boolean' },
			description: 'Mostrar información del autor con avatar y nombre',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
		showExcerpt: {
			control: { type: 'boolean' },
			description: 'Mostrar la descripción/extracto de la historia',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
		showMultimedia: {
			control: { type: 'boolean' },
			description: 'Mostrar los selectores de multimedia asociados a la historia',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
		excerptLines: {
			control: { type: 'range', min: 1, max: 6, step: 1 },
			description: 'Cantidad de líneas a mostrar en la descripción',
			table: { type: { summary: 'number' }, defaultValue: { summary: '2' } },
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
type Story = StoryObj<StoryCardTeaserV3Component>;

// Playground interactivo: un único selector de Obra; la portada, el título y el extracto cambian juntos.
export const Interactiva: StoryObj<StoryCardTeaserV3Component & { storyIndex: number }> = {
	argTypes: {
		storyIndex: {
			name: 'Obra',
			// `labels` debe ir dentro de `control`; como hermano del argType, Storybook lo ignora y muestra el índice.
			control: { type: 'select', labels: corpusLabels },
			options: corpusStories.map((_, index) => index),
			description: 'Obra del corpus de François Onoff; su portada, título y extracto cambian de forma conjunta',
			table: { type: { summary: 'number' } },
		},
	},
	render: (args) => ({
		props: { ...args, stories: corpusStories, covers: corpusCovers },
		template: `
			<cuentoneta-story-card-teaser-v3
				[story]="stories[storyIndex]"
				[coverImageUrl]="covers[storyIndex]"
				[variant]="variant"
				[order]="order"
				[tagLabel]="tagLabel"
				[showAuthor]="showAuthor"
				[showExcerpt]="showExcerpt"
				[showMultimedia]="showMultimedia"
				[excerptLines]="excerptLines"
			/>
		`,
	}),
	args: {
		storyIndex: 0,
		variant: 'on-white',
		order: 1,
		tagLabel: 'Cuento',
		showAuthor: true,
		showExcerpt: true,
		showMultimedia: true,
		excerptLines: 2,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Playground interactivo. Elegí la <strong>Obra</strong> del corpus: su portada, título y extracto cambian de forma conjunta. El resto de los controles ajusta variante, autor, extracto y multimedia.',
			},
		},
	},
};

// Variante OnWhite — imagen a la izquierda, fondo blanco.
export const OnWhite: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-story-card-teaser-v3 ${argsToTemplate(args)} />`,
	}),
	args: {
		story: withMedia(palacioNueveFronterasTeaserMock),
		coverImageUrl: palacioNueveFronterasTeaserMock.coverImage,
		variant: 'on-white',
		order: 1,
		tagLabel: 'Cuento',
		showAuthor: true,
		showExcerpt: true,
		showMultimedia: true,
		excerptLines: 2,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Variante OnWhite: layout horizontal con la imagen a la izquierda, pensada para fondos blancos. Cuando la historia contenga un archivo multimedial para ser reproducido se va a visualizar con un MediaTag, y este deberá utilizarse siempre en su variante <code>Gray</code>.</p><p><strong>Comportamiento:</strong></p><ul><li>El título se trunca a un máximo de 2 líneas.</li><li>El extracto se trunca a un máximo de 2 líneas.</li><li>El avatar y el nombre del autor son elementos clickeables. En estado hover, el nombre se subraya para reforzar la affordance de enlace y permitir el acceso directo al perfil del autor y debe aplicarse únicamente sobre los elementos vinculados al autor, sin afectar el resto del contenido de la card.</li></ul><p><strong>Usos:</strong> Story List, Author List.</p>`,
			},
		},
	},
};

// Variante OnGray — igual a OnWhite pero pensada para fondos grises (selectores en blanco).
export const OnGray: Story = {
	render: (args) => ({
		props: args,
		template: `<div class="rounded-lg bg-neutral-100 p-6"><cuentoneta-story-card-teaser-v3 ${argsToTemplate(args)} /></div>`,
	}),
	args: {
		story: withMedia(geometriaTeaserMock),
		coverImageUrl: geometriaTeaserMock.coverImage,
		variant: 'on-gray',
		order: 1,
		tagLabel: 'Cuento',
		showAuthor: true,
		showExcerpt: true,
		showMultimedia: true,
		excerptLines: 2,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Variante OnGray: idéntica a OnWhite pero con los selectores de multimedia en blanco, pensada para fondos grises. Cuando la historia contenga un archivo multimedial para ser reproducido se va a visualizar con un MediaTag, y este deberá utilizarse siempre en su variante <code>Filled</code>.</p><p><strong>Comportamiento:</strong></p><ul><li>El título se trunca a un máximo de 2 líneas.</li><li>El extracto se trunca a un máximo de 2 líneas.</li><li>El avatar y el nombre del autor son elementos clickeables. En estado hover, el nombre se subraya para reforzar la affordance de enlace y permitir el acceso directo al perfil del autor y debe aplicarse únicamente sobre los elementos vinculados al autor, sin afectar el resto del contenido de la card.</li></ul><p><strong>Usos:</strong> Story {Footer}.</p>`,
			},
		},
	},
};

// Variante Highlighted — tarjeta destacada con la imagen a la derecha.
export const Highlighted: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-story-card-teaser-v3 ${argsToTemplate(args)} />`,
	}),
	args: {
		story: withMedia(elOdioTeaserMock),
		coverImageUrl: elOdioTeaserMock.coverImage,
		variant: 'highlighted',
		order: 1,
		tagLabel: 'Cuento',
		showAuthor: true,
		showExcerpt: true,
		showMultimedia: true,
		excerptLines: 3,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Variante destacada del componente, utilizada para dar mayor relevancia visual a una historia dentro de un listado o sección específica; tarjeta con borde y fondo, con la imagen a la derecha. Cuando la historia contenga un archivo multimedial para ser reproducido se va a visualizar con un MediaTag, y este deberá utilizarse siempre en su variante <code>Filled</code>.</p><p><strong>Comportamiento:</strong></p><ul><li>El título se trunca a un máximo de 2 líneas.</li><li>El extracto se trunca a un máximo de 2 líneas.</li><li>El avatar y el nombre del autor son elementos clickeables. En estado hover, el nombre se subraya para reforzar la affordance de enlace y permitir el acceso directo al perfil del autor y debe aplicarse únicamente sobre los elementos vinculados al autor, sin afectar el resto del contenido de la card.</li><li>En Story List, se muestra el avatar y el nombre del autor.</li><li>En Author List, se ocultan el avatar y el nombre del autor.</li></ul><p><strong>Usos:</strong> Story List, Author List.</p>`,
			},
		},
	},
};

// Vitrina con las tres variantes en simultáneo.
// Nota: se usan bindings explícitos (en lugar de argsToTemplate) porque la variante difiere por
// instancia; argsToTemplate genera bindings `[variant]="variant"` que apuntan a un único `props.variant`.
export const AllVariants: Story = {
	render: (args) => ({
		props: {
			...args,
			stories: [
				withMedia(palacioNueveFronterasTeaserMock),
				withMedia(geometriaTeaserMock),
				withMedia(elOdioTeaserMock),
			],
			covers: [palacioNueveFronterasTeaserMock.coverImage, geometriaTeaserMock.coverImage, elOdioTeaserMock.coverImage],
		},
		template: `
			<div class="flex flex-col gap-10">
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">OnWhite</h3>
					<cuentoneta-story-card-teaser-v3
						variant="on-white"
						[story]="stories[0]"
						[coverImageUrl]="covers[0]"
						[order]="order"
						[tagLabel]="tagLabel"
						[showAuthor]="showAuthor"
						[showExcerpt]="showExcerpt"
						[showMultimedia]="showMultimedia"
						[excerptLines]="excerptLines"
					/>
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">OnGray</h3>
					<div class="rounded-lg bg-neutral-100 p-6">
						<cuentoneta-story-card-teaser-v3
							variant="on-gray"
							[story]="stories[1]"
							[coverImageUrl]="covers[1]"
							[order]="order"
							[tagLabel]="tagLabel"
							[showAuthor]="showAuthor"
							[showExcerpt]="showExcerpt"
							[showMultimedia]="showMultimedia"
							[excerptLines]="excerptLines"
						/>
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">Highlighted</h3>
					<cuentoneta-story-card-teaser-v3
						variant="highlighted"
						[story]="stories[2]"
						[coverImageUrl]="covers[2]"
						[order]="order"
						[tagLabel]="tagLabel"
						[showAuthor]="showAuthor"
						[showExcerpt]="showExcerpt"
						[showMultimedia]="showMultimedia"
						[excerptLines]="3"
					/>
				</div>
			</div>
		`,
	}),
	args: {
		order: 1,
		tagLabel: 'Cuento',
		showAuthor: true,
		showExcerpt: true,
		showMultimedia: true,
		excerptLines: 2,
	},
	parameters: {
		docs: {
			description: {
				story: 'Vista general de las tres variantes del componente con todas las características habilitadas.',
			},
		},
	},
};

// Switch "Cargando" para alternar real↔skeleton en el mismo slot y evaluar la transición/alineación.
// La tarjeta renderiza su propio skeleton cuando no recibe story.
export const Estados: StoryObj<StoryCardTeaserV3Component & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			<div class="w-[680px]">
				@if (loading) {
					<cuentoneta-story-card-teaser-v3
						[variant]="variant"
						[order]="order"
						[showAuthor]="showAuthor"
						[showExcerpt]="showExcerpt"
						[showMultimedia]="showMultimedia"
						[excerptLines]="excerptLines"
					/>
				} @else {
					<cuentoneta-story-card-teaser-v3
						[story]="story"
						[coverImageUrl]="coverImageUrl"
						[variant]="variant"
						[order]="order"
						[tagLabel]="tagLabel"
						[showAuthor]="showAuthor"
						[showExcerpt]="showExcerpt"
						[showMultimedia]="showMultimedia"
						[excerptLines]="excerptLines"
					/>
				}
			</div>
		`,
	}),
	args: {
		loading: true,
		story: withMedia(palacioNueveFronterasTeaserMock),
		coverImageUrl: palacioNueveFronterasTeaserMock.coverImage,
		variant: 'on-white',
		order: 1,
		tagLabel: 'Cuento',
		showAuthor: true,
		showExcerpt: true,
		showMultimedia: true,
		excerptLines: 2,
	},
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

import { applicationConfig, argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { CommonModule } from '@angular/common';

import { StoryCardTeaserV3Component } from './story-card-teaser-v3.component';
import { storyTeaserMock } from '../../mocks/story.mock';
import { authorTeaserMock } from '../../mocks/author.mock';
import { StoryTeaserWithAuthor } from '@models/story.model';
import { Media } from '@models/media.model';

// Imagen alusiva de muestra para las stories (placeholder estable mientras el modelo de dominio
// no exponga aún la URL de la imagen de la historia — ver issue derivado mencionado en #1510).
const coverImageUrl = 'https://picsum.photos/seed/cuentoneta-story/240/328';

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

const meta: Meta<StoryCardTeaserV3Component> = {
	component: StoryCardTeaserV3Component,
	title: 'Componentes V3/StoryCardTeaserV3',
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
		moduleMetadata({
			imports: [CommonModule],
		}),
	],
	parameters: {
		docs: {
			description: {
				component: `<div>
					<p>El componente **StoryCardTeaserV3Component** es la versión 3 de la tarjeta de vista previa de una historia,
					basada en el Design System v3 de La Cuentoneta. Se implementa en cuatro variantes seleccionables mediante el input <code>variant</code>:</p>
					<ul>
						<li><strong>OnWhite</strong> (<code>on-white</code>): layout horizontal con imagen a la izquierda, para fondos blancos.</li>
						<li><strong>OnGray</strong> (<code>on-gray</code>): igual a OnWhite con selectores de multimedia en blanco, para fondos grises.</li>
						<li><strong>Highlighted</strong> (<code>highlighted</code>): tarjeta destacada con borde, fondo e imagen a la derecha.</li>
						<li><strong>Compact</strong> (<code>compact</code>): layout vertical angosto con imagen, numeración y multimedia apiladas.</li>
					</ul>
					<p>Cada variante admite mostrar opcionalmente autor, descripción, numeración, etiqueta y selectores de multimedia.</p>
				</div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		variant: {
			control: { type: 'select' },
			options: ['on-white', 'on-gray', 'highlighted', 'compact'],
			description: 'Variante visual del componente',
			table: {
				type: { summary: "'on-white' | 'on-gray' | 'highlighted' | 'compact'" },
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
			description: 'URL de la imagen alusiva a la historia (si no se provee, se muestra un placeholder)',
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
		showDescription: {
			control: { type: 'boolean' },
			description: 'Mostrar la descripción/extracto de la historia (no aplica a la variante compact)',
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

// Playground interactivo: permite alternar todos los inputs sobre cualquier variante.
export const Docs: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-story-card-teaser-v3 ${argsToTemplate(args)} />`,
	}),
	args: {
		story: storyMock,
		variant: 'on-white',
		order: 1,
		coverImageUrl,
		tagLabel: 'Cuento',
		showAuthor: true,
		showDescription: true,
		showMultimedia: true,
		excerptLines: 2,
	},
	parameters: {
		docs: {
			description: {
				story: 'Playground interactivo. Usá los controles de abajo para alternar la variante y el resto de los inputs.',
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
		story: storyMock,
		variant: 'on-white',
		order: 1,
		coverImageUrl,
		tagLabel: 'Cuento',
		showAuthor: true,
		showDescription: true,
		showMultimedia: true,
		excerptLines: 2,
	},
	parameters: {
		docs: {
			description: {
				story: 'Variante OnWhite: layout horizontal con la imagen a la izquierda, pensada para fondos blancos.',
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
		story: storyMock,
		variant: 'on-gray',
		order: 1,
		coverImageUrl,
		tagLabel: 'Cuento',
		showAuthor: true,
		showDescription: true,
		showMultimedia: true,
		excerptLines: 2,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Variante OnGray: idéntica a OnWhite pero con los selectores de multimedia en blanco, para fondos grises.',
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
		story: storyMock,
		variant: 'highlighted',
		order: 1,
		coverImageUrl,
		tagLabel: 'Cuento',
		showAuthor: true,
		showDescription: true,
		showMultimedia: true,
		excerptLines: 3,
	},
	parameters: {
		docs: {
			description: { story: 'Variante Highlighted: tarjeta destacada con borde y fondo, con la imagen a la derecha.' },
		},
	},
};

// Variante Compact — layout vertical angosto.
export const Compact: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-story-card-teaser-v3 ${argsToTemplate(args)} />`,
	}),
	args: {
		story: storyMock,
		variant: 'compact',
		order: 1,
		coverImageUrl,
		tagLabel: 'Cuento',
		showAuthor: true,
		showMultimedia: true,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Variante Compact: layout vertical angosto con imagen, numeración y multimedia apiladas. No muestra descripción.',
			},
		},
	},
};

// Vitrina con las cuatro variantes en simultáneo.
// Nota: se usan bindings explícitos (en lugar de argsToTemplate) porque la variante difiere por
// instancia; argsToTemplate genera bindings `[variant]="variant"` que apuntan a un único `props.variant`.
export const AllVariants: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="flex flex-col gap-10">
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">OnWhite</h3>
					<cuentoneta-story-card-teaser-v3
						variant="on-white"
						[story]="story"
						[order]="order"
						[coverImageUrl]="coverImageUrl"
						[tagLabel]="tagLabel"
						[showAuthor]="showAuthor"
						[showDescription]="showDescription"
						[showMultimedia]="showMultimedia"
						[excerptLines]="excerptLines"
					/>
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">OnGray</h3>
					<div class="rounded-lg bg-neutral-100 p-6">
						<cuentoneta-story-card-teaser-v3
							variant="on-gray"
							[story]="story"
							[order]="order"
							[coverImageUrl]="coverImageUrl"
							[tagLabel]="tagLabel"
							[showAuthor]="showAuthor"
							[showDescription]="showDescription"
							[showMultimedia]="showMultimedia"
							[excerptLines]="excerptLines"
						/>
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">Highlighted</h3>
					<cuentoneta-story-card-teaser-v3
						variant="highlighted"
						[story]="story"
						[order]="order"
						[coverImageUrl]="coverImageUrl"
						[tagLabel]="tagLabel"
						[showAuthor]="showAuthor"
						[showDescription]="showDescription"
						[showMultimedia]="showMultimedia"
						[excerptLines]="3"
					/>
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">Compact</h3>
					<cuentoneta-story-card-teaser-v3
						variant="compact"
						[story]="story"
						[order]="order"
						[coverImageUrl]="coverImageUrl"
						[tagLabel]="tagLabel"
						[showAuthor]="showAuthor"
						[showMultimedia]="showMultimedia"
					/>
				</div>
			</div>
		`,
	}),
	args: {
		story: storyMock,
		order: 1,
		coverImageUrl,
		tagLabel: 'Cuento',
		showAuthor: true,
		showDescription: true,
		showMultimedia: true,
		excerptLines: 2,
	},
	parameters: {
		docs: {
			description: {
				story: 'Vista general de las cuatro variantes del componente con todas las características habilitadas.',
			},
		},
	},
};

// Estado de carga: la tarjeta renderiza el esqueleto cuando la story aun no esta disponible.
export const Loading: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="flex flex-col gap-10">
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">OnWhite</h3>
					<cuentoneta-story-card-teaser-v3 variant="on-white" [order]="order" [showAuthor]="showAuthor" [showDescription]="showDescription" [showMultimedia]="showMultimedia" [excerptLines]="excerptLines" />
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">Highlighted</h3>
					<cuentoneta-story-card-teaser-v3 variant="highlighted" [order]="order" [showAuthor]="showAuthor" [showDescription]="showDescription" [showMultimedia]="showMultimedia" [excerptLines]="3" />
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">Compact</h3>
					<cuentoneta-story-card-teaser-v3 variant="compact" [order]="order" [showAuthor]="showAuthor" [showMultimedia]="showMultimedia" />
				</div>
			</div>
		`,
	}),
	args: {
		story: undefined,
		order: 1,
		showAuthor: true,
		showDescription: true,
		showMultimedia: true,
		excerptLines: 2,
	},
	parameters: {
		docs: {
			description: {
				story: 'Estado de carga (esqueleto) que se muestra mientras la story no esta disponible.',
			},
		},
	},
};

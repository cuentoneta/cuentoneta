import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';

import { StoryMediaSelectorsComponent } from './story-media-selectors.component';
import { Media } from '@models/media.model';

// Conjunto de medios variado: 3 videos de YouTube (muestra el contador en modo agrupado),
// un Space de X y un episodio de Spotify.
const media: Media[] = [
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

const meta: Meta<StoryMediaSelectorsComponent> = {
	component: StoryMediaSelectorsComponent,
	title: 'Componentes V3/StoryMediaSelectors',
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div>
					<p>El componente **StoryMediaSelectorsComponent** renderiza los selectores de los recursos multimedia
					(YouTube, X, Spotify, audio) asociados a una historia. Es un componente de presentación: no monta los
					widgets, solo emite el recurso seleccionado vía el output <code>selected</code>.</p>
					<ul>
						<li><code>selectable = false</code> (por defecto): agrupa por plataforma con un contador (badge). Decorativo.</li>
						<li><code>selectable = true</code>: un selector clickeable por recurso; al click emite el <code>Media</code> vía <code>selected</code>.</li>
					</ul>
					<p>El input <code>theme</code> (<code>subtle</code> / <code>solid</code> / <code>bordered</code>) y
					<code>orientation</code> (<code>horizontal</code> / <code>vertical</code>) controlan la presentación.</p>
				</div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		media: { control: { type: 'object' }, description: 'Recursos multimedia de la historia' },
		theme: {
			control: { type: 'inline-radio' },
			options: ['subtle', 'solid', 'bordered'],
			description: 'Tema visual del recuadro y el contador',
			table: { defaultValue: { summary: 'subtle' } },
		},
		orientation: {
			control: { type: 'inline-radio' },
			options: ['horizontal', 'vertical'],
			table: { defaultValue: { summary: 'horizontal' } },
		},
		selectable: {
			control: { type: 'boolean' },
			description: 'Si es true, un selector clickeable por recurso que emite `selected`; si es false, agrupa con badge',
			table: { defaultValue: { summary: 'false' } },
		},
		selected: { action: 'selected' },
	},
};

export default meta;
type Story = StoryObj<StoryMediaSelectorsComponent>;

// Modo agrupado (decorativo) — usado por StoryCardTeaserV3.
export const Grouped: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-story-media-selectors ${argsToTemplate(args)} />` }),
	args: { media, theme: 'subtle', orientation: 'horizontal', selectable: false },
	parameters: {
		docs: {
			description: { story: 'Modo agrupado: un selector por plataforma con contador. Tema `subtle` (OnWhite).' },
		},
	},
};

// Modo seleccionable (interactivo) — pensado para la vista Story.
export const Selectable: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-story-media-selectors ${argsToTemplate(args)} />` }),
	args: { media, theme: 'solid', orientation: 'horizontal', selectable: true },
	parameters: {
		docs: {
			description: {
				story: 'Modo seleccionable: un botón por recurso. Al hacer click emite el `Media` (ver la pestaña Actions).',
			},
		},
	},
};

// Vitrina de los tres temas en sus contextos de fondo.
// Nota: se usan bindings explícitos (en lugar de argsToTemplate) porque theme/orientation difieren
// por instancia; argsToTemplate genera `[theme]="theme"` que apunta a un único `props.theme`.
export const Themes: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="flex flex-col gap-6">
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">subtle (sobre blanco)</h3>
					<cuentoneta-story-media-selectors [media]="media" [selectable]="selectable" theme="subtle" />
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">solid (sobre gris)</h3>
					<div class="rounded-lg bg-neutral-100 p-6">
						<cuentoneta-story-media-selectors [media]="media" [selectable]="selectable" theme="solid" />
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">bordered (tarjeta destacada)</h3>
					<div class="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
						<cuentoneta-story-media-selectors [media]="media" [selectable]="selectable" theme="bordered" />
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">orientation vertical</h3>
					<cuentoneta-story-media-selectors [media]="media" [selectable]="selectable" theme="solid" orientation="vertical" />
				</div>
			</div>
		`,
	}),
	args: { media, selectable: false },
	parameters: {
		docs: { description: { story: 'Los tres temas en su contexto de fondo y la orientación vertical.' } },
	},
};

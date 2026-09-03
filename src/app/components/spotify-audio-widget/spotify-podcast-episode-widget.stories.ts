import { Meta, StoryObj } from '@storybook/angular-vite';
import { SpotifyPodcastEpisodeWidget } from './spotify-podcast-episode-widget';
import { onoffSpotifyPodcastEpisodesMock } from '@mocks/onoff-media.mock';

const meta: Meta<SpotifyPodcastEpisodeWidget> = {
	title: 'Widgets/SpotifyPodcastEpisode',
	component: SpotifyPodcastEpisodeWidget,
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div><p>El componente <strong>SpotifyPodcastEpisodeWidget</strong> muestra un episodio de podcast de Spotify asociado a una obra: el embed y la descripción del recurso.</p><p>La descripción llega desde el backend como HTML ya saneado (<code>SanitizedHtml</code>, derivado del Markdown que carga el CMS) y se pinta con <code>[innerHTML]</code> dentro de un <code>&lt;div&gt;</code>, porque el HTML que produce el pipeline ya trae su propio <code>&lt;p&gt;</code>.</p><p>Quien monta este widget es <a href="./?path=/docs/componentes-v3-mediawidgetselector--docs" target="_top"><strong>MediaWidgetSelector</strong></a>, que lo resuelve contra el registry de medios según el tipo de media y le delega toda la vista.</p></div>`,
			},
		},
	},
	argTypes: {
		media: {
			description:
				'Episodio de podcast de Spotify: título, URL del episodio y la descripción como HTML saneado a partir del Markdown del CMS.',
			control: { type: 'object' },
		},
	},
};

export default meta;
type Story = StoryObj<SpotifyPodcastEpisodeWidget>;

export const Widget: Story = {
	args: {
		media: onoffSpotifyPodcastEpisodesMock[0],
	},
};

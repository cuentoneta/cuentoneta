import { Meta, StoryObj } from '@storybook/angular-vite';
import { YoutubeVideoWidgetComponent } from './youtube-video-widget.component';
import { onoffYouTubeVideosMock } from '@mocks/onoff-media.mock';

const meta: Meta<YoutubeVideoWidgetComponent> = {
	title: 'Widgets/YoutubeVideo',
	component: YoutubeVideoWidgetComponent,
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div><p>El componente <strong>YoutubeVideoWidgetComponent</strong> muestra un video de YouTube asociado a una obra: el embed y la descripción del recurso.</p><p>La descripción llega desde el backend como HTML ya saneado (<code>SanitizedHtml</code>, derivado del Markdown que carga el CMS) y se pinta con <code>[innerHTML]</code> dentro de un <code>&lt;div&gt;</code>, porque el HTML que produce el pipeline ya trae su propio <code>&lt;p&gt;</code>.</p><p>El despachador <strong>MediaResourceComponent</strong> —hoy deprecado, sobrevive mientras la página de Story lo consuma— no tiene entrada propia en el catálogo: resuelve el widget contra el registry de medios según el tipo de media y delega acá toda la vista.</p></div>`,
			},
		},
	},
	argTypes: {
		media: {
			description:
				'Video de YouTube: título, ID del video y la descripción como HTML saneado a partir del Markdown del CMS.',
			control: { type: 'object' },
		},
	},
};

export default meta;
type Story = StoryObj<YoutubeVideoWidgetComponent>;

export const Widget: Story = {
	args: {
		media: onoffYouTubeVideosMock[0],
	},
};

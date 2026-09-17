import type { Meta, StoryObj } from '@storybook/angular-vite';
import { YoutubeVideoWidgetComponent } from './youtube-video-widget.component';
import { onoffYouTubeVideosMock } from '@mocks/onoff-media.mock';
import { embedPlaceholdersDecorator } from '@testing/storybook-embed-placeholders';

const meta: Meta<YoutubeVideoWidgetComponent> = {
	title: 'Widgets/YoutubeVideo',
	component: YoutubeVideoWidgetComponent,
	decorators: embedPlaceholdersDecorator,
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div><p>El componente <strong>YoutubeVideoWidgetComponent</strong> muestra un video de YouTube asociado a una obra: el embed y la descripción del recurso.</p><p>La descripción llega desde el backend como HTML ya saneado (<code>SanitizedHtml</code>, derivado del Markdown que carga el CMS) y se pinta con <code>[innerHTML]</code> dentro de un <code>&lt;div&gt;</code>, porque el HTML que produce el pipeline ya trae su propio <code>&lt;p&gt;</code>.</p><p>Quien monta este widget es <a href="./?path=/docs/componentes-v3-mediawidgetselector--docs" target="_top"><strong>MediaWidgetSelector</strong></a>, que lo resuelve contra el registry de medios según el tipo de media y le delega toda la vista.</p><p><strong>En el catálogo el embed es una imagen local</strong> que ocupa su lugar: el corpus no depende de un video subido a una cuenta de terceros, que podría caerse, bloquearse por región o quedar privado sin que ningún gate lo note. La maquetación —proporción, recorte, cómo convive con la descripción— es la real; el contenido no.</p></div>`,
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

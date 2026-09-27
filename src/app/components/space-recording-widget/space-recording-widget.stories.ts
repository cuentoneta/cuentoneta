import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { SpaceRecordingWidget } from './space-recording-widget';
import { onoffSpaceRecordingsMock } from '@mocks/onoff-media.mock';
import { mediaWidgetSelectorDocs } from '@components/media-widget-selector/media-widget-selector.docs';
import { docsRef } from '@testing/storybook-docs';

export type DocsSymbols = [SpaceRecordingWidget];

const meta: Meta<SpaceRecordingWidget> = {
	title: 'Widgets/SpaceRecording',
	component: SpaceRecordingWidget,
	decorators: [
		moduleMetadata({
			imports: [CommonModule, NgOptimizedImage],
		}),
	],
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div><p>El componente <strong>SpaceRecordingWidget</strong> muestra la grabación de un Space de X asociado a una obra: título, anfitrión con su avatar, fecha, duración, reproductor y la descripción del recurso.</p><p>Cuando la grabación no trae URL —porque la proyección embebida no la resuelve, o porque el Space no tiene audio adjunto en el CMS— el reproductor se reemplaza por un placeholder visible en vez de renderizar un control roto.</p><p>La descripción llega desde el backend como HTML ya saneado (<code>SanitizedHtml</code>, derivado del Markdown que carga el CMS) y se pinta con <code>[innerHTML]</code> dentro de un <code>&lt;div&gt;</code>, porque el HTML que produce el pipeline ya trae su propio <code>&lt;p&gt;</code>.</p><p>Quien monta este widget es ${docsRef(mediaWidgetSelectorDocs)}, que lo resuelve contra el registry de medios según el tipo de media y le delega toda la vista.</p></div>`,
			},
		},
	},
	argTypes: {
		media: {
			description:
				'Grabación de un Space de X: título, metadata del anfitrión, fecha, duración, URL del audio y la descripción como HTML saneado a partir del Markdown del CMS.',
			control: { type: 'object' },
		},
	},
};

export default meta;
type Story = StoryObj<SpaceRecordingWidget>;

export const Widget: Story = {
	args: {
		media: onoffSpaceRecordingsMock[0],
	},
};

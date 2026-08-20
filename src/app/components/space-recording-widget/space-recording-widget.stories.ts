import { Meta, StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { SpaceRecordingWidgetComponent } from './space-recording-widget.component';
import { onoffSpaceRecordingsMock } from '@mocks/onoff-media.mock';

const meta: Meta<SpaceRecordingWidgetComponent> = {
	title: 'Widgets/SpaceRecording',
	component: SpaceRecordingWidgetComponent,
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
				component: `<div><p>El componente <strong>SpaceRecordingWidgetComponent</strong> muestra la grabación de un Space de X asociado a una obra: título, anfitrión con su avatar, fecha, duración, reproductor y la descripción del recurso.</p><p>Cuando la grabación no trae URL —porque la proyección embebida no la resuelve, o porque el Space no tiene audio adjunto en el CMS— el reproductor se reemplaza por un placeholder visible en vez de renderizar un control roto.</p><p>La descripción llega desde el backend como HTML ya saneado (<code>SanitizedHtml</code>, derivado del Markdown que carga el CMS) y se pinta con <code>[innerHTML]</code> dentro de un <code>&lt;div&gt;</code>, porque el HTML que produce el pipeline ya trae su propio <code>&lt;p&gt;</code>.</p><p>El despachador <strong>MediaResourceComponent</strong> —hoy deprecado, sobrevive mientras las páginas de Story y Storylist lo consuman— no tiene entrada propia en el catálogo: resuelve el widget contra el registry de medios según el tipo de media y delega acá toda la vista.</p></div>`,
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
type Story = StoryObj<SpaceRecordingWidgetComponent>;

export const Widget: Story = {
	args: {
		media: onoffSpaceRecordingsMock[0],
	},
};

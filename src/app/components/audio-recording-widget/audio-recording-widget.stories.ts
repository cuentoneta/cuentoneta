import { Meta, StoryObj } from '@storybook/angular-vite';
import { AudioRecordingWidgetComponent } from './audio-recording-widget.component';
import { onoffAudioRecordingsMock } from '@mocks/onoff-media.mock';

const meta: Meta<AudioRecordingWidgetComponent> = {
	title: 'Widgets/AudioRecording',
	component: AudioRecordingWidgetComponent,
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div><p>El componente <strong>AudioRecordingWidgetComponent</strong> muestra una grabación de audio de una obra: el reproductor nativo y la descripción del recurso.</p><p>La descripción llega desde el backend como HTML ya saneado (<code>SanitizedHtml</code>, derivado del Markdown que carga el CMS) y se pinta con <code>[innerHTML]</code> dentro de un <code>&lt;div&gt;</code>, porque el HTML que produce el pipeline ya trae su propio <code>&lt;p&gt;</code>.</p><p>El despachador <strong>MediaResourceComponent</strong> no tiene catálogo propio: elige el widget según el tipo de media y delega acá toda la vista.</p></div>`,
			},
		},
	},
	argTypes: {
		media: {
			description:
				'Grabación de audio: título, URL del audio y la descripción como HTML saneado a partir del Markdown del CMS.',
			control: { type: 'object' },
		},
	},
};

export default meta;
type Story = StoryObj<AudioRecordingWidgetComponent>;

export const Widget: Story = {
	args: {
		media: onoffAudioRecordingsMock[0],
	},
};

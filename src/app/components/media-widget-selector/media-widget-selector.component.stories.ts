import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';

import { MediaWidgetSelector } from './media-widget-selector.component';
import {
	onoffLiteraryWorksWithMultipleMediaSources,
	onoffLiteraryWorksWithSingleMediaSource,
} from '@mocks/onoff-literary-works.mock';

// Las dos obras se toman por capacidad y no por slug: el selector reparte el corpus por el umbral que el
// componente decide (hay entre qué elegir o no), así que enriquecer otra obra no obliga a tocar esto.
const [singleSourceWork] = onoffLiteraryWorksWithSingleMediaSource;
const [multipleSourcesWork] = onoffLiteraryWorksWithMultipleMediaSources;

const meta: Meta<MediaWidgetSelector> = {
	component: MediaWidgetSelector,
	title: 'Componentes V3/MediaWidgetSelector',
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El componente <strong>MediaWidgetSelector</strong> ofrece los formatos alternativos en los que se puede consumir una obra —audio, espacio grabado, episodio de podcast, video— y monta el widget del que está elegido.</p><ul><li><strong>Título:</strong> visible siempre que la obra traiga al menos un medio; su texto cambia según haya o no elección.</li><li><strong>Botonera:</strong> solo cuando hay <strong>más de un</strong> medio. Con uno solo no hay entre qué elegir y el widget se monta directo. La fila la pone <a href="./?path=/docs/componentes-v3-buttongroup--docs" target="_top"><strong>ButtonGroup</strong></a> en su geometría chica; el vocabulario de la pantalla —qué ícono y qué etiqueta le toca a cada tipo— lo aporta este componente.</li><li><strong>Widget:</strong> lo resuelve el catálogo <code>mediaWidgetRegistry</code>, que aparea cada tipo de medio con su componente y es el mismo que consume el despachador de la página de Story.</li></ul><p>Hay <strong>un botón por recurso</strong>, no por formato: una obra con dos videos ofrece los dos. Cuando un tipo se repite, el nombre del formato dejaría de distinguir un botón del otro, así que la etiqueta pasa a ser el título del medio — es una decisión de este componente, no del diseño, que no modela ese caso.</p><p>Los widgets pintan su propia descripción, así que el componente no la repite. Comparar con <a href="./?path=/docs/componentes-v3-mediaselectors--docs" target="_top"><strong>MediaSelectors</strong></a>, que resume los recursos de una tarjeta agrupándolos por plataforma sin montar nada.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		mediaSources: {
			control: { type: 'object' },
			description: 'Recursos multimedia de la obra',
			table: { type: { summary: 'readonly Media[]' }, defaultValue: { summary: '[]' } },
		},
	},
};

export default meta;
type Story = StoryObj<MediaWidgetSelector>;

export const MultiplesFormatos: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-media-widget-selector ${argsToTemplate(args)} />` }),
	args: { mediaSources: multipleSourcesWork.mediaSources },
	parameters: {
		docs: {
			description: {
				story: `<p>Una obra del corpus con varios formatos (<strong>${multipleSourcesWork.title}</strong>): el título anuncia la elección, la botonera ofrece un botón por recurso y debajo se monta el widget del elegido.</p><p>Clickeá los botones para ver cómo cambia el widget. Al abrir, queda elegido el primer medio.</p>`,
			},
		},
	},
};

export const UnSoloFormato: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-media-widget-selector ${argsToTemplate(args)} />` }),
	args: { mediaSources: singleSourceWork.mediaSources },
	parameters: {
		docs: {
			description: {
				story: `<p>Una obra del corpus con un único formato (<strong>${singleSourceWork.title}</strong>): el título cambia de texto y la botonera desaparece, pero el widget se monta igual.</p>`,
			},
		},
	},
};

export const TipoRepetido: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-media-widget-selector ${argsToTemplate(args)} />` }),
	// Ninguna obra del canon repite un tipo todavía, así que la precondición se compone de dos que sí
	// existen. El día que una lo repita, esta story pasa a tomarla del corpus como las demás.
	args: { mediaSources: [...multipleSourcesWork.mediaSources, ...singleSourceWork.mediaSources] },
	parameters: {
		docs: {
			description: {
				story: `<p>El caso que el diseño no modela: dos recursos del mismo tipo. Los botones de audio se rotulan con el <strong>título de cada medio</strong> en lugar del nombre del formato, que los volvería indistinguibles; los tipos que aparecen una sola vez conservan el nombre del formato.</p>`,
			},
		},
	},
};

export const SinFormatos: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-media-widget-selector ${argsToTemplate(args)} />` }),
	args: { mediaSources: [] },
	parameters: {
		docs: {
			description: {
				story:
					'<p>El caso por defecto de una obra sin multimedia: el canvas queda vacío a propósito, sin título ni botonera.</p>',
			},
		},
	},
};

import type { Meta, StoryObj } from '@storybook/angular-vite';

import { docsMention } from '@testing/storybook-docs';

import { ShareMenu } from './share-menu';
import { shareMenuDocs } from './share-menu.docs';

const meta: Meta<ShareMenu> = {
	title: 'Componentes V3/ShareMenu',
	component: ShareMenu,
	parameters: {
		layout: 'centered',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El ${docsMention(shareMenuDocs)} despliega los destinos de compartir de una obra sobre el botón que lo monta. El panel lo promueve el navegador al <code>top layer</code> (<code>popover="auto"</code>) y lo ancla al borde derecho de su disparador con CSS Anchor Positioning: abrirlo y cerrarlo —al elegir un destino, con <code>Escape</code> y con click afuera— lo resuelve la plataforma, y el componente reacciona a ese estado anunciándolo en el disparador y llevando el foco a la primera opción.</p><p>El enlace y el texto que se comparten llegan por <code>url</code> y <code>message</code>: cuál es el enlace canónico de la obra lo decide quien lo monta.</p></div>`,
			},
		},
	},
	argTypes: {
		url: {
			control: 'text',
			description: 'Enlace que se comparte: la URL canónica de la obra',
			table: { type: { summary: 'string' } },
		},
		message: {
			control: 'text',
			description: 'Texto que acompaña al enlace en las redes que lo aceptan',
			table: { type: { summary: 'string' } },
		},
	},
};

export default meta;
type Story = StoryObj<ShareMenu>;

export const Obra: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-share-menu [message]="message" [url]="url" />` }),
	args: {
		url: 'https://cuentoneta.ar/literary-work/el-fin',
		message:
			'Leí "El fin" de Jorge Luis Borges en La Cuentoneta y te lo comparto. Sumate a leer este y otros cuentos en este link:',
	},
	parameters: {
		docs: {
			description: {
				story:
					'<p>El botón despliega el menú con sus opciones. <strong>Usos:</strong> la barra de lectura de la página de obra.</p>',
			},
		},
	},
};

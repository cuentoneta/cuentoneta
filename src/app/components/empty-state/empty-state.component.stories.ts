import type { Meta, StoryObj } from '@storybook/angular-vite';
import { argsToTemplate } from '@storybook/angular-vite';

import { EmptyStateComponent } from './empty-state.component';

const meta: Meta<EmptyStateComponent> = {
	component: EmptyStateComponent,
	title: 'Componentes V3/EmptyState',
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El <strong>EmptyState</strong> avisa que una sección no tiene nada que mostrar. Ocupa el lugar de la grilla, con el mismo ancho que ella, para que la sección no quede en blanco debajo de su encabezado.</p><p>Solo recibe el mensaje: sin ícono ni acción, porque todavía no hay un caso que los pida. El texto no se anuncia como alerta ni como estado — es texto de la página, que se lee en su lugar y no interrumpe.</p></div>`,
			},
		},
	},
	argTypes: {
		message: {
			control: { type: 'text' },
			description: 'Qué falta y por qué, en los términos de la sección que lo monta',
			table: { type: { summary: 'string' } },
		},
	},
};
export default meta;
type Story = StoryObj<EmptyStateComponent>;

export const Primary: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-empty-state ${argsToTemplate(args)} />`,
	}),
	args: { message: 'Todavía no hay obras publicadas esta semana' },
	parameters: {
		docs: {
			description: {
				story: `<p>El mensaje de las dos secciones de obras de la página de inicio cuando la semana no trae contenido.</p><p><strong>Usos:</strong> cualquier sección cuya lista puede venir vacía.</p>`,
			},
		},
	},
};

export const MensajeLargo: Story = {
	name: 'Mensaje largo',
	render: (args) => ({
		props: args,
		template: `<cuentoneta-empty-state ${argsToTemplate(args)} />`,
	}),
	args: {
		message:
			'Todavía no hay colecciones publicadas esta semana. Mientras tanto, podés recorrer el catálogo completo y descubrir obras de autores y autoras de distintas épocas.',
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Con un mensaje de varias líneas la caja crece y el texto sigue centrado. Es lo que fija que el alto mínimo sea un piso y no una altura fija.</p><p><strong>Usos:</strong> revisar el bloque antes de redactar un mensaje largo.</p>`,
			},
		},
	},
};

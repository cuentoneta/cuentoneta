import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { ButtonComponent } from './button.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandFacebook, faBrandTwitter, faBrandWhatsapp } from '@ng-icons/font-awesome/brands';

const meta: Meta<ButtonComponent> = {
	title: 'Componentes V3/Button',
	component: ButtonComponent,
	parameters: {
		layout: 'centered',
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div><p>El <strong>ButtonComponent</strong> del Design System v3 es un componente basado en atributo (<code>cuentoneta-button</code>) que se aplica indistintamente sobre elementos <code>&lt;button&gt;</code> y <code>&lt;a&gt;</code>, manteniendo estilos consistentes y la semántica correcta de cada elemento (acción vs. navegación).</p><p>Se implementa en tres variantes seleccionables mediante el input <code>type</code>:</p><ul><li><strong>filled</strong> (default): fondo blanco, sin borde, para la acción principal.</li><li><strong>outline</strong>: fondo blanco con borde neutral-300, para acciones secundarias y enlaces de tipo "Ver todo".</li><li><strong>share</strong>: fondo neutral-100, tamaño más compacto, pensado para botones de compartir en redes (admite un ícono al inicio).</li></ul></div>`,
			},
		},
	},
	argTypes: {
		type: {
			control: 'select',
			options: ['filled', 'outline', 'share'],
			description: 'Estilo visual del botón basado en el sistema de diseño de Figma',
			table: {
				type: { summary: "'filled' | 'outline' | 'share'" },
				defaultValue: { summary: 'filled' },
			},
		},
	},
	decorators: [
		applicationConfig({
			providers: [provideRouter([]), provideIcons({ faBrandFacebook, faBrandTwitter, faBrandWhatsapp })],
		}),
	],
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Filled: Story = {
	render: (args) => ({
		props: args,
		template: `<button cuentoneta-button [type]="type">Button</button>`,
	}),
	args: {
		type: 'filled',
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>filled</strong> (default): fondo blanco sin borde, para la acción principal de un bloque.</p><p><strong>Usos:</strong> llamados a la acción primarios sobre fondos de marca o destacados.</p>`,
			},
		},
	},
};

export const Outline: Story = {
	render: (args) => ({
		props: args,
		template: `<button cuentoneta-button [type]="type">Ver todo</button>`,
	}),
	args: {
		type: 'outline',
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>outline</strong>: fondo blanco con borde neutral-300, para acciones secundarias.</p><p><strong>Usos:</strong> enlaces "Ver todo" al pie de los listados de la Home y secciones de exploración.</p>`,
			},
		},
	},
};

export const Share: Story = {
	render: () => ({
		template: `				<div>
					<div class="flex items-center gap-2">
						<button cuentoneta-button type="share"><ng-icon name="faBrandFacebook"/>Facebook</button>
						<button cuentoneta-button type="share"><ng-icon name="faBrandTwitter"/>Twitter</button>
						<button cuentoneta-button type="share"><ng-icon name="faBrandWhatsapp"/>WhatsApp</button>
					</div>
				</div>`,
		moduleMetadata: {
			imports: [NgIcon],
		},
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>share</strong>: tamaño compacto con fondo neutral-100; admite un ícono de red al inicio del texto.</p><p><strong>Usos:</strong> barra de compartir en redes dentro de la página de Story.</p>`,
			},
		},
	},
};

export const OnAnchorElement: Story = {
	render: () => ({
		template: `<a cuentoneta-button type="outline" routerLink="/storylist">Ver todo</a>`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>El componente se aplica sobre un <code>&lt;a&gt;</code> con <code>routerLink</code>: conserva el estilo de botón pero la semántica de enlace, navegando como un link accesible.</p><p><strong>Usos:</strong> "Ver todo" cuando la acción es una navegación de ruta y no una acción imperativa.</p>`,
			},
		},
	},
};

export const Disabled: Story = {
	render: () => ({
		template: `
			<div class="flex flex-wrap items-center gap-4">
				<button cuentoneta-button type="filled" disabled>Filled</button>
				<button cuentoneta-button type="outline" disabled>Outline</button>
				<button cuentoneta-button type="share" disabled>Share</button>
			</div>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>Estado deshabilitado (<code>disabled</code>) de las tres variantes: cursor bloqueado y opacidad reducida.</p><p><strong>Usos:</strong> acciones no disponibles temporalmente (p. ej. mientras se completa una precondición).</p>`,
			},
		},
	},
};

export const Showcase: Story = {
	render: () => ({
		template: `
			<div class="flex flex-wrap items-center gap-4">
				<button cuentoneta-button type="filled">Filled</button>
				<button cuentoneta-button type="outline">Outline</button>
				<button cuentoneta-button type="share"><ng-icon name="faBrandTwitter"/>Share</button>
			</div>
		`,
		moduleMetadata: {
			imports: [NgIcon],
		},
	}),
	parameters: {
		docs: { description: { story: 'Las tres variantes activas: filled, outline y share.' } },
	},
};

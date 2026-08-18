import { Meta, StoryObj, applicationConfig } from '@storybook/angular-vite';
import { ButtonComponent } from './button.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandFacebook, faBrandTwitter, faBrandWhatsapp } from '@ng-icons/font-awesome/brands';
import { simpleSpotify } from '@ng-icons/simple-icons';

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
				component: `<div><p>El <strong>ButtonComponent</strong> del Design System v3 es un componente basado en atributo (<code>cuentoneta-button</code>) que se aplica indistintamente sobre elementos <code>&lt;button&gt;</code> y <code>&lt;a&gt;</code>, manteniendo estilos consistentes y la semántica correcta de cada elemento (acción vs. navegación).</p><p>Se configura con <strong>tres ejes independientes</strong>, que se combinan libremente:</p><ul><li><code>type</code> — la <strong>apariencia</strong>: <strong>filled</strong> (default, fondo blanco sin borde), <strong>outline</strong> (fondo blanco con borde neutral-300) y <strong>share</strong> (fondo neutral-100 sin borde).</li><li><code>size</code> — la <strong>geometría</strong>: <strong>md</strong> (default, acciones de página), <strong>sm</strong> (compacto, para filas de opciones) y <strong>xs</strong> (el más chico, acciones accesorias).</li><li><code>active</code> — el <strong>estado</strong>: marca al botón como la opción vigente de un grupo e invierte el contraste a fondo neutral-900, sin borde.</li></ul><p>Los ejes se mantienen separados a propósito: si la apariencia y la geometría vivieran en un solo <code>type</code>, cada pantalla que combinara distinto agregaría una variante al catálogo, nombrada por su consumidor. El Figma modela tipo y tamaño como props aparte por el mismo motivo.</p></div>`,
			},
		},
	},
	argTypes: {
		type: {
			control: 'inline-radio',
			options: ['filled', 'outline', 'share'],
			description: 'Apariencia: fondo, borde y color de texto',
			table: {
				type: { summary: "'filled' | 'outline' | 'share'" },
				defaultValue: { summary: 'filled' },
			},
		},
		size: {
			control: 'inline-radio',
			options: ['md', 'sm', 'xs'],
			description: 'Geometría: padding, tamaño de fuente y separación entre ícono y texto',
			table: {
				type: { summary: "'md' | 'sm' | 'xs'" },
				defaultValue: { summary: 'md' },
			},
		},
		active: {
			control: 'boolean',
			description:
				'Marca el botón como la opción vigente de un grupo; reemplaza la apariencia por el contraste invertido',
			table: { defaultValue: { summary: 'false' } },
		},
	},
	decorators: [
		applicationConfig({
			providers: [provideIcons({ faBrandFacebook, faBrandTwitter, faBrandWhatsapp, simpleSpotify })],
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
						<button cuentoneta-button type="share" size="xs"><ng-icon name="faBrandFacebook"/>Facebook</button>
						<button cuentoneta-button type="share" size="xs"><ng-icon name="faBrandTwitter"/>Twitter</button>
						<button cuentoneta-button type="share" size="xs"><ng-icon name="faBrandWhatsapp"/>WhatsApp</button>
					</div>
				</div>`,
		moduleMetadata: {
			imports: [NgIcon],
		},
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>Apariencia <strong>share</strong> en el tamaño <strong>xs</strong>: fondo neutral-100 y un ícono de red al inicio del texto. Los dos ejes van explícitos — <code>type</code> ya no arrastra la geometría.</p><p><strong>Usos:</strong> barra de compartir en redes dentro de la página de Story.</p>`,
			},
		},
	},
};

export const Sizes: Story = {
	render: () => ({
		template: `
			<div class="flex flex-wrap items-center gap-4">
				<button cuentoneta-button type="outline" size="md">md</button>
				<button cuentoneta-button type="outline" size="sm"><ng-icon name="simpleSpotify"/>sm</button>
				<button cuentoneta-button type="outline" size="xs"><ng-icon name="simpleSpotify"/>xs</button>
			</div>
		`,
		moduleMetadata: { imports: [NgIcon] },
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>Los tres tamaños sobre una misma apariencia: cambia el padding, el tamaño de fuente y la separación entre ícono y texto, y nada más.</p>`,
			},
		},
	},
};

export const Active: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="flex flex-wrap items-center gap-4">
				<button cuentoneta-button type="filled" [active]="active">Filled</button>
				<button cuentoneta-button type="outline" [active]="active">Outline</button>
				<button cuentoneta-button type="share" size="xs" [active]="active">Share</button>
			</div>
		`,
	}),
	args: { active: true },
	parameters: {
		docs: {
			description: {
				story: `<p>El estado <code>active</code> reemplaza la apariencia por el contraste invertido —fondo neutral-900, texto neutral-50, sin borde—, así que las tres convergen al mismo tratamiento. Es deliberado: <em>estar elegido</em> es un estado del botón, no una apariencia más del catálogo.</p><p>Mové el control para comparar contra el estado normal. Quien coordina la elección dentro de un grupo es el componente contenedor, que además debe emitir <code>aria-pressed</code>: el color no se anuncia.</p>`,
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
				<button cuentoneta-button type="share" size="xs" disabled>Share</button>
				<button cuentoneta-button type="outline" size="sm" [active]="true" disabled>Activo</button>
			</div>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>Estado deshabilitado (<code>disabled</code>): cursor bloqueado y opacidad reducida. Es independiente de los otros tres ejes, así que una opción elegida puede quedar deshabilitada sin perder su tratamiento.</p><p><strong>Usos:</strong> acciones no disponibles temporalmente (p. ej. mientras se completa una precondición).</p>`,
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
				<button cuentoneta-button type="share" size="xs"><ng-icon name="faBrandTwitter"/>Share</button>
				<button cuentoneta-button type="outline" size="sm"><ng-icon name="simpleSpotify"/>Opción</button>
				<button cuentoneta-button type="outline" size="sm" [active]="true"><ng-icon name="simpleSpotify"/>Opción</button>
			</div>
		`,
		moduleMetadata: {
			imports: [NgIcon],
		},
	}),
	parameters: {
		docs: {
			description: {
				story:
					'Las tres apariencias y las combinaciones que hoy usa la app, incluida la opción de un grupo en sus dos estados — que no es una variante nueva, sino <code>outline</code> en tamaño <code>sm</code>.',
			},
		},
	},
};

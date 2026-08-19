import { argsToTemplate, Meta, StoryObj, applicationConfig } from '@storybook/angular-vite';
import { ButtonComponent } from './button.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandWhatsapp } from '@ng-icons/font-awesome/brands';

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
				component: `<div><p>El <strong>ButtonComponent</strong> del Design System v3 es un componente basado en atributo (<code>cuentoneta-button</code>) que se aplica indistintamente sobre elementos <code>&lt;button&gt;</code> y <code>&lt;a&gt;</code>, manteniendo estilos consistentes y la semántica correcta de cada elemento (acción vs. navegación).</p><p>Su API son <strong>tres ejes independientes</strong> que se combinan libremente, en lugar de un catálogo de variantes:</p><ul><li><code>type</code> — la <strong>apariencia</strong>: fondo, borde y color de texto. <code>filled</code> (default, fondo blanco sin borde), <code>outline</code> (fondo blanco con borde neutral-300) y <code>subtle</code> (fondo neutral-100 sin borde).</li><li><code>size</code> — la <strong>geometría</strong>: padding, tamaño de fuente y separación entre ícono y texto. <code>md</code> (default) y <code>xs</code>.</li><li><code>active</code> — el <strong>estado</strong> de opción vigente dentro de un grupo, que reemplaza la apariencia por el contraste invertido.</li></ul><p>Están separados porque mezclarlos obliga a agregar una variante nueva cada vez que una pantalla necesita una apariencia existente en otro tamaño, y esa variante termina nombrada por su consumidor en lugar de por su apariencia.</p><p>Coordinar qué opción está vigente, que la elección sea excluyente y anunciarla con <code>aria-pressed</code> son responsabilidad del componente contenedor: el botón solo sabe pintarse.</p></div>`,
			},
		},
	},
	argTypes: {
		type: {
			control: 'inline-radio',
			options: ['filled', 'outline', 'subtle'],
			description: 'Apariencia del botón: fondo, borde y color de texto',
			table: {
				type: { summary: "'filled' | 'outline' | 'subtle'" },
				defaultValue: { summary: 'filled' },
			},
		},
		size: {
			control: 'inline-radio',
			options: ['md', 'xs'],
			description: 'Geometría del botón: padding, tamaño de fuente y separación entre ícono y texto',
			table: {
				type: { summary: "'md' | 'xs'" },
				defaultValue: { summary: 'md' },
			},
		},
		active: {
			control: 'boolean',
			description: 'Marca al botón como la opción vigente dentro de un grupo',
			table: {
				type: { summary: 'boolean' },
				defaultValue: { summary: 'false' },
			},
		},
	},
	decorators: [
		applicationConfig({
			providers: [provideIcons({ faBrandWhatsapp })],
		}),
	],
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Playground: Story = {
	render: (args) => ({
		props: args,
		template: `<button cuentoneta-button ${argsToTemplate(args)}>Button</button>`,
	}),
	args: {
		type: 'filled',
		size: 'md',
		active: false,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Los tres ejes como controles vivos sobre una misma instancia: cualquier combinación de apariencia, geometría y estado se expresa sin agregar valores al catálogo.</p>`,
			},
		},
	},
};

export const Appearances: Story = {
	render: () => ({
		template: `
			<div class="flex flex-wrap items-center gap-4">
				<button cuentoneta-button type="filled">Filled</button>
				<button cuentoneta-button type="outline">Outline</button>
				<button cuentoneta-button type="subtle">Subtle</button>
			</div>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>Las tres apariencias al mismo tamaño: lo único que cambia entre ellas es el fondo, el borde y el color del texto.</p><p><strong>Usos:</strong> <code>filled</code> para la acción principal de un bloque, <code>outline</code> para acciones secundarias y enlaces "Ver todo", <code>subtle</code> para acciones de menor jerarquía sobre fondos claros.</p>`,
			},
		},
	},
};

export const Sizes: Story = {
	render: () => ({
		template: `
			<div class="flex flex-wrap items-center gap-4">
				<button cuentoneta-button type="subtle" size="md"><ng-icon name="faBrandWhatsapp" />Medium</button>
				<button cuentoneta-button type="subtle" size="xs"><ng-icon name="faBrandWhatsapp" />Extra small</button>
			</div>
		`,
		moduleMetadata: {
			imports: [NgIcon],
		},
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>La misma apariencia en las dos geometrías: cambian el padding, el tamaño de fuente y la separación entre el ícono y el texto, y nada más.</p>`,
			},
		},
	},
};

export const ActiveOption: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="flex flex-wrap items-center gap-4">
				<button cuentoneta-button type="filled" [active]="active">Filled</button>
				<button cuentoneta-button type="outline" [active]="active">Outline</button>
				<button cuentoneta-button type="subtle" [active]="active">Subtle</button>
			</div>
		`,
	}),
	args: {
		active: true,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>El estado de opción vigente reemplaza la apariencia por el contraste invertido, igual en las tres: estar elegido es un estado del botón y no una apariencia más del catálogo. El control <code>active</code> alterna contra el estado normal.</p><p>El botón no emite <code>aria-pressed</code> ni decide quién está elegido: eso lo aporta el contenedor que coordina el grupo.</p>`,
			},
		},
	},
};

export const AxesMatrix: Story = {
	render: () => ({
		template: `
			<div class="flex flex-col gap-4">
				<div class="flex flex-wrap items-center gap-4">
					<button cuentoneta-button type="filled" size="md">Filled md</button>
					<button cuentoneta-button type="outline" size="md">Outline md</button>
					<button cuentoneta-button type="subtle" size="md">Subtle md</button>
				</div>
				<div class="flex flex-wrap items-center gap-4">
					<button cuentoneta-button type="filled" size="xs">Filled xs</button>
					<button cuentoneta-button type="outline" size="xs">Outline xs</button>
					<button cuentoneta-button type="subtle" size="xs">Subtle xs</button>
				</div>
				<div class="flex flex-wrap items-center gap-4">
					<button cuentoneta-button type="outline" size="md" [active]="true">Vigente md</button>
					<button cuentoneta-button type="outline" size="xs" [active]="true">Vigente xs</button>
				</div>
			</div>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>La grilla de apariencia × geometría, más la fila de opción vigente: el catálogo es el producto de los ejes, no una lista de variantes que haya que enumerar.</p>`,
			},
		},
	},
};

export const OnAnchorElement: Story = {
	render: () => ({
		template: `<a cuentoneta-button type="outline" routerLink="/collection">Ver todo</a>`,
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
				<button cuentoneta-button type="subtle" disabled>Subtle</button>
				<button cuentoneta-button type="outline" [active]="true" disabled>Vigente</button>
			</div>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>El estado deshabilitado es independiente de los tres ejes: baja la opacidad y bloquea el cursor sobre cualquier combinación, incluida la opción vigente.</p><p><strong>Usos:</strong> acciones no disponibles temporalmente (p. ej. mientras se completa una precondición).</p>`,
			},
		},
	},
};

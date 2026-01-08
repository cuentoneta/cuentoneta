import { Meta, StoryObj, applicationConfig } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { ButtonComponent } from './button.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandFacebook, faBrandTwitter, faBrandWhatsapp } from '@ng-icons/font-awesome/brands';

const meta: Meta<ButtonComponent> = {
	title: 'Components/Button',
	component: ButtonComponent,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		type: {
			control: 'select',
			options: ['filled', 'outline', 'share'],
			description: 'Visual style of the button based on Figma design system',
			table: {
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
		template: `<button cuentonetaButton [type]="type">Button</button>`,
	}),
	args: {
		type: 'filled',
	},
};

export const Outline: Story = {
	render: (args) => ({
		props: args,
		template: `<button cuentonetaButton [type]="type">Ver todo</button>`,
	}),
	args: {
		type: 'outline',
	},
};

export const Share: Story = {
	render: () => ({
		template: `<button cuentonetaButton type="share"><ng-icon name="faBrandFacebook"/>Compartir</button>`,
		moduleMetadata: {
			imports: [NgIcon],
		},
	}),
};

export const OnAnchorElement: Story = {
	render: () => ({
		template: `<a cuentonetaButton type="outline" routerLink="/storylist">Ver todo</a>`,
	}),
};

export const Disabled: Story = {
	render: () => ({
		template: `
			<div class="flex flex-wrap items-center gap-4">
				<button cuentonetaButton type="filled" disabled>Filled</button>
				<button cuentonetaButton type="outline" disabled>Outline</button>
				<button cuentonetaButton type="share" disabled>Share</button>
			</div>
		`,
	}),
};

export const UsageExample: Story = {
	render: () => ({
		template: `
			<div class="space-y-8">
				<div>
					<h3 class="mb-4 font-inter text-lg font-semibold">Caso de uso: Encabezado de sección</h3>
					<div class="flex items-center justify-between rounded-lg border border-neutral-200 p-4" style="width: 400px;">
						<div>
							<h4 class="font-inter text-xl font-bold">Colecciones</h4>
							<p class="font-inter text-sm text-neutral-600">Historias agrupadas por temas</p>
						</div>
						<a cuentonetaButton type="outline" href="/storylist">Ver todo</a>
					</div>
				</div>

				<div>
					<h3 class="mb-4 font-inter text-lg font-semibold">Caso de uso: Botón de compartir</h3>
					<div class="flex items-center gap-2">
						<button cuentonetaButton type="share"><ng-icon name="faBrandFacebook"/>Facebook</button>
						<button cuentonetaButton type="share"><ng-icon name="faBrandTwitter"/>Twitter</button>
						<button cuentonetaButton type="share"><ng-icon name="faBrandWhatsapp"/>WhatsApp</button>
					</div>
				</div>

				<div>
					<h3 class="mb-4 font-inter text-lg font-semibold">Caso de uso: Acciones de formulario</h3>
					<div class="flex items-center justify-end gap-3 rounded-lg border border-neutral-200 p-4" style="width: 400px;">
						<button cuentonetaButton type="outline">Cancelar</button>
						<button cuentonetaButton type="filled">Guardar</button>
					</div>
				</div>
			</div>
		`,
		moduleMetadata: {
			imports: [NgIcon],
		},
	}),
};

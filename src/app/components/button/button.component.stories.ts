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
		docs: {
			canvas: {
				sourceState: 'shown',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		type: {
			control: 'select',
			options: ['filled', 'outline', 'share'],
			description: 'Estilo visual del botón basado en el sistema de diseño de Figma',
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
		template: `<button cuentoneta-button [type]="type">Button</button>`,
	}),
	args: {
		type: 'filled',
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
};

export const OnAnchorElement: Story = {
	render: () => ({
		template: `<a cuentoneta-button type="outline" routerLink="/storylist">Ver todo</a>`,
	}),
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
};

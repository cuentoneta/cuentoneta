import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';

import { TagComponent } from './tag.component';

const meta: Meta<TagComponent> = {
	component: TagComponent,
	title: 'Componentes/Tag',
	parameters: {
		docs: {
			description: {
				component: `<div>
					<p>El componente **TagComponent** es la etiqueta (tag) del Design System v3. Reemplaza progresivamente
					a <code>BadgeComponent</code>. Soporta tres variantes (input <code>variant</code>):</p>
					<ul>
						<li><strong>soft</strong> (default): solo texto en brand-500, sin fondo.</li>
						<li><strong>filled</strong>: pill brand-50 con texto brand-500 en mayúsculas.</li>
						<li><strong>gray</strong>: pill translúcido oscuro con texto claro, para mostrarse sobre imágenes.</li>
					</ul>
				</div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		label: { control: { type: 'text' } },
		variant: {
			control: { type: 'inline-radio' },
			options: ['soft', 'filled', 'gray'],
			table: { defaultValue: { summary: 'soft' } },
		},
	},
};

export default meta;
type Story = StoryObj<TagComponent>;

export const Soft: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-tag ${argsToTemplate(args)} />` }),
	args: { label: 'Crónica', variant: 'soft' },
};

export const Filled: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-tag ${argsToTemplate(args)} />` }),
	args: { label: 'Crónica', variant: 'filled' },
};

export const Gray: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-tag ${argsToTemplate(args)} />` }),
	args: { label: 'Crónica', variant: 'gray' },
};

export const Showcase: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="flex items-center gap-3">
				<cuentoneta-tag [label]="label" variant="soft" />
				<cuentoneta-tag [label]="label" variant="filled" />
				<cuentoneta-tag [label]="label" variant="gray" />
			</div>
		`,
	}),
	args: { label: 'Crónica' },
	parameters: { docs: { description: { story: 'Las tres variantes: soft, filled y gray.' } } },
};

import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { TagComponent } from './tag.component';
import { TagSkeletonComponent } from './tag-skeleton.component';

const meta: Meta<TagComponent> = {
	component: TagComponent,
	title: 'Componentes V3/Tag',
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
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

// Estado de carga (skeleton) del tag.
export const Skeleton: StoryObj = {
	decorators: [moduleMetadata({ imports: [TagSkeletonComponent] })],
	render: () => ({ template: `<cuentoneta-tag-skeleton />` }),
	parameters: {
		docs: { description: { story: 'Skeleton de carga del tag.' } },
	},
};

// Switch "Cargando" para alternar real↔skeleton en el mismo slot y evaluar la transición/alineación.
export const Estados: StoryObj<TagComponent & { loading: boolean }> = {
	decorators: [moduleMetadata({ imports: [TagSkeletonComponent] })],
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			@if (loading) {
				<cuentoneta-tag-skeleton />
			} @else {
				<cuentoneta-tag [label]="label" [variant]="variant" />
			}
		`,
	}),
	args: { loading: true, label: 'Crónica', variant: 'filled' },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

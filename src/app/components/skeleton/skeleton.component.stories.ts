import { Meta, StoryObj } from '@storybook/angular';

import { SkeletonComponent } from './skeleton.component';

const meta: Meta<SkeletonComponent> = {
	component: SkeletonComponent,
	title: 'Componentes V3/Skeleton',
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El componente <strong>SkeletonComponent</strong> es la barra de carga (skeleton) in-house del Design System v3. Reemplaza a la dependencia <code>ngx-skeleton-loader</code>. El host <em>es</em> la barra: el alto, el ancho y el color se controlan con clases utilitarias de Tailwind directamente sobre el elemento (<code>&lt;cuentoneta-skeleton class="h-[36px] w-[40px] bg-brand-300" /&gt;</code>). El único input es <code>appearance</code> (<strong>line</strong> / <strong>circle</strong> / <strong>square</strong>), que define la forma. Para múltiples barras, el consumidor repite el elemento con <code>@for</code>.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		appearance: {
			control: { type: 'inline-radio' },
			options: ['line', 'circle', 'square'],
			description: 'Forma del skeleton: line (radio chico), circle (avatar redondo) o square (sin radio impuesto)',
			table: { type: { summary: "'line' | 'circle' | 'square'" }, defaultValue: { summary: 'line' } },
		},
	},
};

export default meta;
type Story = StoryObj<SkeletonComponent>;

export const Line: Story = {
	render: () => ({ template: `<cuentoneta-skeleton appearance="line" class="h-4 w-48 bg-neutral-300" />` }),
	parameters: {
		docs: {
			description: {
				story: `<p>Forma <strong>line</strong> (default): barra con radio chico para representar líneas de texto.</p><p><strong>Usos:</strong> placeholders de títulos, párrafos y metadatos en los skeletons de las tarjetas.</p>`,
			},
		},
	},
};

export const Circle: Story = {
	render: () => ({ template: `<cuentoneta-skeleton appearance="circle" class="w-10 bg-neutral-300" />` }),
	parameters: {
		docs: {
			description: {
				story: `<p>Forma <strong>circle</strong>: fuerza un aspecto cuadrado redondeado para representar avatares.</p><p><strong>Usos:</strong> placeholder del avatar del autor en los skeletons de teasers y tarjetas.</p>`,
			},
		},
	},
};

export const Square: Story = {
	render: () => ({ template: `<cuentoneta-skeleton appearance="square" class="h-20 w-20 bg-neutral-200" />` }),
	parameters: {
		docs: {
			description: {
				story: `<p>Forma <strong>square</strong>: no impone radio (lo deja en manos del consumidor) para representar bloques e imágenes.</p><p><strong>Usos:</strong> placeholder de portadas e imágenes dentro de los skeletons.</p>`,
			},
		},
	},
};

export const MultipleLines: Story = {
	render: () => ({
		template: `
			<div class="flex flex-col gap-2">
				@for (line of [0, 1, 2]; track line) {
					<cuentoneta-skeleton appearance="line" class="h-4 w-full bg-neutral-300" />
				}
			</div>
		`,
	}),
	parameters: { docs: { description: { story: 'Varias barras: el consumidor itera con `@for`.' } } },
};

export const Showcase: Story = {
	render: () => ({
		template: `
			<article class="flex items-start gap-4">
				<cuentoneta-skeleton appearance="circle" class="w-20 shrink-0 bg-neutral-300" />
				<div class="flex flex-1 flex-col gap-2 pt-1">
					<cuentoneta-skeleton appearance="line" class="h-6 w-40 bg-neutral-300" />
					<cuentoneta-skeleton appearance="line" class="h-4 w-24 bg-brand-100" />
				</div>
			</article>
		`,
	}),
	parameters: {
		docs: { description: { story: 'Composición típica de un teaser: avatar circular + líneas de texto.' } },
	},
};

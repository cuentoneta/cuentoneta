import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { CoverImageComponent } from './cover-image.component';
import { CoverImageSkeletonComponent } from './cover-image-skeleton.component';

const coverImageUrl =
	'https://cdn.sanity.io/images/s4dbqkc5/production/edd62a3131bd1f46e796e473d0b2b12d1c63c229-1024x1536.png';

const meta: Meta<CoverImageComponent> = {
	component: CoverImageComponent,
	title: 'Componentes V3/CoverImage',
	tags: ['autodocs'],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Imagen de portada (cover) de una historia, usada por las tarjetas del Design System v3 (<a href="./?path=/docs/componentes-v3-storycardteaserv3--docs" target="_top"><strong>StoryCardTeaserV3</strong></a> y <a href="./?path=/docs/componentes-v3-homestorycard--docs" target="_top"><strong>HomeStoryCard</strong></a>). Tamaño fijo 118×164; si no se provee <code>src</code>, muestra el placeholder del Design System. Es decorativa: el click se delega al enlace de la tarjeta.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		src: {
			control: { type: 'text' },
			description: 'URL de la imagen; si se omite, se muestra el placeholder',
			table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
		},
		priority: {
			control: { type: 'boolean' },
			description: 'Marca el cover como prioritario (above-the-fold) para la carga',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
	},
};

export default meta;
type Story = StoryObj<CoverImageComponent>;

export const WithImage: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-cover-image ${argsToTemplate(args)} />` }),
	args: { src: coverImageUrl },
	parameters: { docs: { description: { story: 'Cover con imagen.' } } },
};

export const Placeholder: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-cover-image ${argsToTemplate(args)} />` }),
	args: {},
	parameters: { docs: { description: { story: 'Sin `src`: se muestra el placeholder del Design System.' } } },
};

// Switch "Cargando" para alternar real↔skeleton en el mismo slot y evaluar la transición/alineación.
export const Estados: StoryObj<CoverImageComponent & { loading: boolean }> = {
	decorators: [moduleMetadata({ imports: [CoverImageSkeletonComponent] })],
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			@if (loading) {
				<cuentoneta-cover-image-skeleton />
			} @else {
				<cuentoneta-cover-image [src]="src" [priority]="priority" />
			}
		`,
	}),
	args: { loading: true, src: coverImageUrl },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

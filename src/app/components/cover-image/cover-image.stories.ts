import type { Meta, StoryObj } from '@storybook/angular-vite';
import { argsToTemplate, moduleMetadata } from '@storybook/angular-vite';

import { CoverImage } from './cover-image';
import { CoverImageSkeleton } from './cover-image-skeleton';
import { corpusCovers, literaryWorkSelectArgType } from '@mocks/onoff-corpus.storybook';
import { literaryWorkTeaserCardDocs } from '@components/literary-work-teaser-card/literary-work-teaser-card.docs';
import { literaryWorkTeaserHomeCardDocs } from '@components/literary-work-teaser-home-card/literary-work-teaser-home-card.docs';
import { docsRef } from '@testing/storybook-docs';

const coverImageUrl = 'assets/img/mocks/stories/geometria.png';

const meta: Meta<CoverImage> = {
	component: CoverImage,
	title: 'Componentes V3/CoverImage',
	tags: ['autodocs'],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Imagen de portada (cover) de una obra, usada por las tarjetas del Design System v3 (${docsRef(literaryWorkTeaserCardDocs)} y ${docsRef(literaryWorkTeaserHomeCardDocs)}). El alto es fijo (164) y el ancho sigue la proporción de la imagen, hasta un máximo de 132 que recorta el excedente. Si no se provee <code>src</code>, muestra el placeholder del Design System. Es decorativa: el click se delega al enlace de la tarjeta.</p></div>`,
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
type Story = StoryObj<CoverImage>;

export const WithImage: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-cover-image ${argsToTemplate(args)} />` }),
	args: { src: coverImageUrl },
	parameters: { docs: { description: { story: 'Cover con imagen.' } } },
};

export const Interactiva: StoryObj<CoverImage & { coverIndex: number }> = {
	argTypes: {
		coverIndex: {
			...literaryWorkSelectArgType,
			description: 'Portada a visualizar, elegida entre las covers del corpus disponibles en los assets del proyecto',
		},
	},
	render: (args) => ({
		props: { ...args, covers: corpusCovers },
		template: `<cuentoneta-cover-image [src]="covers[coverIndex]" [priority]="priority" />`,
	}),
	args: { coverIndex: 0, priority: false },
	parameters: {
		docs: {
			description: {
				story:
					'Elegí la <strong>Obra</strong> para visualizar su portada entre las covers del corpus disponibles en los assets del proyecto.',
			},
		},
	},
};

export const Apaisadas: Story = {
	render: () => {
		// Las portadas del corpus comparten proporción, así que las otras salen de assets propios.
		const squareImageUrl = 'assets/img/mocks/author/francois-onoff.png';
		const wideImageUrl = 'assets/img/mocks/banners/banner-el-palacio-mobile.png';
		return {
			props: { sources: [coverImageUrl, squareImageUrl, wideImageUrl] },
			template: `
					<div class="flex gap-4">
						@for (source of sources; track source) {
							<cuentoneta-cover-image [src]="source" />
						}
					</div>
				`,
		};
	},
	parameters: {
		docs: {
			description: {
				story:
					'Tres imágenes de proporciones distintas con el mismo alto: la de la portada, una cuadrada y una muy apaisada. Cada caja toma el ancho que le da su imagen, sin fondo gris, hasta el máximo de 132: la cuadrada y la muy apaisada lo alcanzan y recortan lo que lo excede.',
			},
		},
	},
};

export const Placeholder: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-cover-image ${argsToTemplate(args)} />` }),
	args: {},
	parameters: { docs: { description: { story: 'Sin `src`: se muestra el placeholder del Design System.' } } },
};

export const Estados: StoryObj<CoverImage & { loading: boolean }> = {
	decorators: [moduleMetadata({ imports: [CoverImageSkeleton] })],
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

import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CollectionTeaser } from './collection-teaser';
import { provideRouter } from '@angular/router';
import { CollectionTeaserSkeletonComponent } from './collection-teaser-skeleton';
import { collectionCoverImagesMock, collectionCoverImagesWithGapMock, storylistMock } from '@mocks/storylist.mock';
import { StorylistTeaser } from '@models/storylist.model';

const collectionMock: StorylistTeaser = { ...storylistMock, stories: [], tabs: [] };
// Multiple: sin featuredImage y con 3 o más historias; las portadas de las stories arman el abanico.
const collectionMultipleMock: StorylistTeaser = {
	...collectionMock,
	featuredImage: '',
	count: 3,
	coverImages: collectionCoverImagesMock,
};
const collectionSinglePlaceholderMock: StorylistTeaser = { ...collectionMock, featuredImage: '', coverImages: [] };
const collectionMultiplePlaceholderMock: StorylistTeaser = {
	...collectionMultipleMock,
	coverImages: collectionCoverImagesWithGapMock,
};
const collectionAllPlaceholdersMock: StorylistTeaser = { ...collectionMultipleMock, coverImages: [] };

const meta: Meta<CollectionTeaser> = {
	component: CollectionTeaser,
	title: 'Componentes V3/CollectionTeaser',
	tags: ['autodocs'],
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
		moduleMetadata({
			imports: [CollectionTeaserSkeletonComponent],
		}),
	],
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div><p>Tarjeta de una colección (storylist) para el Design System v3: portada, título, descripción y footer con tag y contador de historias. La portada usa <a href="./?path=/docs/componentes-v3-coverimage--docs" target="_top"><strong>CoverImage</strong></a> para unificar el tratamiento de imagen/placeholder con el resto de las tarjetas v3. La variante se deriva del dato: <strong>Single</strong> (una portada) cuando la colección tiene <code>featuredImage</code> o agrupa menos de 3 historias; <strong>Multiple</strong> (abanico de 3 portadas de las historias) cuando no tiene <code>featuredImage</code> y agrupa 3 o más. Cada portada faltante muestra el placeholder.</p></div>`,
			},
		},
	},
};
export default meta;

export const Single = {
	render: (args: CollectionTeaser) => ({
		props: args,
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <cuentoneta-collection-teaser class="card" [collection]="collection"/>
          <cuentoneta-collection-teaser-skeleton class="card w-full"/>
    </div>
`,
	}),
	args: {
		collection: collectionMock,
	},
	parameters: {
		docs: { description: { story: 'Variante Single: una única portada representativa de la colección.' } },
	},
};

export const Multiple = {
	render: (args: CollectionTeaser) => ({
		props: args,
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <cuentoneta-collection-teaser class="card" [collection]="collection"/>
          <cuentoneta-collection-teaser-skeleton class="card w-full"/>
    </div>
`,
	}),
	args: {
		collection: collectionMultipleMock,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Variante Multiple: abanico de 3 portadas (las de los primeros 3 textos) para colecciones de distintos autores.',
			},
		},
	},
};

export const SinglePlaceholder = {
	render: (args: CollectionTeaser) => ({
		props: args,
		template: `
      <div class="p-4">
          <cuentoneta-collection-teaser class="card" [collection]="collection"/>
    </div>
`,
	}),
	args: {
		collection: collectionSinglePlaceholderMock,
	},
	parameters: {
		docs: {
			description: { story: 'Variante Single sin portada: CoverImage muestra el placeholder del Design System.' },
		},
	},
};

export const MultiplePlaceholder = {
	render: (args: CollectionTeaser) => ({
		props: args,
		template: `
      <div class="p-4">
          <cuentoneta-collection-teaser class="card" [collection]="collection"/>
    </div>
`,
	}),
	args: {
		collection: collectionMultiplePlaceholderMock,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Variante Multiple con una portada faltante: el slot sin imagen muestra el placeholder dentro del abanico.',
			},
		},
	},
};

export const MultipleAllPlaceholders = {
	render: (args: CollectionTeaser) => ({
		props: args,
		template: `
      <div class="p-4">
          <cuentoneta-collection-teaser class="card" [collection]="collection"/>
    </div>
`,
	}),
	args: {
		collection: collectionAllPlaceholdersMock,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Variante Multiple sin ninguna portada (colección de 3+ historias sin imágenes): el abanico muestra 3 placeholders, como en el diseño de Figma.',
			},
		},
	},
};

export const Estados: StoryObj<CollectionTeaser & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			<div class="card p-4">
				@if (loading) {
					<cuentoneta-collection-teaser-skeleton class="w-full" />
				} @else {
					<cuentoneta-collection-teaser [collection]="collection" />
				}
			</div>
		`,
	}),
	args: { loading: true, collection: collectionMock },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

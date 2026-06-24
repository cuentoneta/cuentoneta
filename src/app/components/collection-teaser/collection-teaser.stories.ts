import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CollectionTeaser } from './collection-teaser';
import { provideRouter } from '@angular/router';
import { CollectionTeaserSkeletonComponent } from './collection-teaser-skeleton';
import { collectionCoverImagesMock, storylistMock } from '@mocks/storylist.mock';
import { StorylistTeaser } from '@models/storylist.model';

const collectionMock: StorylistTeaser = { ...storylistMock, stories: [], tabs: [] };
const collectionMultipleMock: StorylistTeaser = { ...collectionMock, coverImages: collectionCoverImagesMock };

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
				component: `<div><p>Tarjeta de una colección (storylist) para el Design System v3: portada, título, descripción y footer con tag y contador de historias. La portada usa <a href="./?path=/docs/componentes-v3-coverimage--docs" target="_top"><strong>CoverImage</strong></a> para unificar el tratamiento de imagen/placeholder con el resto de las tarjetas v3. Tiene dos variantes de portada: <strong>Single</strong> (una portada de la colección) y <strong>Multiple</strong> (abanico de 3 portadas para colecciones de distintos autores), derivada automáticamente cuando hay 2 o más portadas distintas.</p></div>`,
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

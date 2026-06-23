import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CollectionTeaser } from './collection-teaser';
import { provideRouter } from '@angular/router';
import { CollectionTeaserSkeletonComponent } from './collection-teaser-skeleton';
import { storylistMock } from '@mocks/storylist.mock';

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
				component: `<div><p>Tarjeta de una colección (storylist) para el Design System v3: portada, título, descripción y footer con tag y contador de historias. La portada usa <a href="./?path=/docs/componentes-v3-coverimage--docs" target="_top"><strong>CoverImage</strong></a> para unificar el tratamiento de imagen/placeholder con el resto de las tarjetas v3.</p></div>`,
			},
		},
	},
};
export default meta;

export const Primary = {
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
		collection: storylistMock,
	},
};

// Switch "Cargando" para alternar real↔skeleton en el mismo slot y evaluar la transición/alineación.
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
	args: { loading: true, collection: storylistMock },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

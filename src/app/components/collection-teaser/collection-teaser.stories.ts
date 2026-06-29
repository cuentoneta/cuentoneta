import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CollectionTeaser } from './collection-teaser';
import { provideRouter } from '@angular/router';
import { CollectionTeaserSkeletonComponent } from './collection-teaser-skeleton';
import { storylistTeaserRepresentativeMock, storylistTeaserSampleMock } from '@mocks/storylist.mock';

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
				component: `<div><p>Tarjeta de una colección (storylist) para el Design System v3: portada, título, descripción y footer con tag y contador de historias. La portada se resuelve con el objeto de valor <strong>imagery</strong>: <strong>representative</strong> (una portada editorial propia de la colección) o <strong>sample</strong> (composición de 3 portadas de sus historias, con placeholder en los slots vacíos). Usa <a href="./?path=/docs/componentes-v3-coverimage--docs" target="_top"><strong>CoverImage</strong></a> para cada portada.</p></div>`,
			},
		},
	},
};
export default meta;

export const Primary = {
	render: () => ({
		props: { representative: storylistTeaserRepresentativeMock, sample: storylistTeaserSampleMock },
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <cuentoneta-collection-teaser class="card" [collection]="representative"/>
          <cuentoneta-collection-teaser class="card" [collection]="sample"/>
    </div>
`,
	}),
};

export const Interactiva: StoryObj<CollectionTeaser & { kind: 'representative' | 'sample' }> = {
	argTypes: {
		kind: {
			control: { type: 'inline-radio' },
			options: ['representative', 'sample'],
			name: 'Tipo de imagery',
		},
	},
	render: (args) => ({
		props: {
			collection: args.kind === 'representative' ? storylistTeaserRepresentativeMock : storylistTeaserSampleMock,
		},
		template: `
			<div class="card p-4">
				<cuentoneta-collection-teaser [collection]="collection" />
			</div>
		`,
	}),
	args: { kind: 'representative' },
	parameters: {
		docs: {
			description: {
				story:
					'Cambiá "Tipo de imagery" para alternar entre la variante representative (portada editorial propia) y sample (composición de 3 portadas de historias).',
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
	args: { loading: true, collection: storylistTeaserRepresentativeMock },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

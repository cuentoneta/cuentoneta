import type { Meta, StoryObj } from '@storybook/angular-vite';
import { argsToTemplate } from '@storybook/angular-vite';
import { CollectionCoverComponent } from './collection-cover.component';
import {
	onoffCollectionsWithRepresentativeImageryMock,
	onoffCollectionsWithSampleImageryMock,
} from '@mocks/onoff-collections.mock';

const [representativeCollection] = onoffCollectionsWithRepresentativeImageryMock;
const [sampleCollection] = onoffCollectionsWithSampleImageryMock;

const representativeImagery = representativeCollection.imagery;
const sampleImagery = sampleCollection.imagery;
const sampleImages = sampleImagery.kind === 'sample' ? sampleImagery.images : ['', '', ''];

const meta: Meta<CollectionCoverComponent> = {
	title: 'Componentes V3/CollectionCover',
	component: CollectionCoverComponent,
	parameters: {
		layout: 'centered',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El <strong>CollectionCoverComponent</strong> del Design System v3 es a la portada de una colección lo que <a href="./?path=/docs/componentes-v3-coverimage--docs" target="_top"><strong>CoverImage</strong></a> es a la de una obra: resuelve las dos formas que declara el dominio y produce una caja de alto constante.</p><ul><li><code>representative</code>: la imagen editorial de la colección, en la caja de una portada (118×164).</li><li><code>sample</code>: el abanico de tres portadas de obras que contiene, sobre una caja de 270×164 — la del frente es la primera, elevada respecto de las laterales, que se apoyan más abajo y sangran por el borde inferior.</li></ul><p>Las dos formas <strong>miden lo mismo de alto</strong>, que es lo que permite intercambiarlas —y sustituirlas por un esqueleto— sin mover lo que sigue en la columna.</p><p>El marco es del consumidor: el componente no aporta fondo, radio exterior ni recorte. <strong>CollectionTeaserCard</strong> lo monta dentro de su caja gris; <strong>CollectionInfoPanel</strong>, pelado.</p></div>`,
			},
		},
	},
	argTypes: {
		imagery: {
			control: { type: 'object' },
			description: 'La portada que declara el dominio: una imagen editorial o el abanico de tres obras',
			table: { type: { summary: 'CollectionImagery' } },
		},
		priority: {
			control: 'boolean',
			description: 'Marca la portada del frente como prioritaria, para cuando entra above-the-fold',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
	},
};

export default meta;
type Story = StoryObj<CollectionCoverComponent>;

const render: Story['render'] = (args) => ({
	props: args,
	template: `<cuentoneta-collection-cover ${argsToTemplate(args)} />`,
});

export const Representativa: Story = {
	render,
	args: { imagery: representativeImagery },
	parameters: {
		docs: {
			description: {
				story: `<p>La colección con imagen editorial propia: una sola portada, en la misma caja que usa cualquier obra.</p><p><strong>Usos:</strong> colecciones curadas con arte propio.</p>`,
			},
		},
	},
};

export const Abanico: Story = {
	render,
	args: { imagery: sampleImagery },
	parameters: {
		docs: {
			description: {
				story: `<p>La colección sin imagen propia se representa con tres portadas de obras que contiene. La primera va al frente y elevada; las otras dos se apoyan más abajo y sangran por el borde inferior de la caja.</p><p><strong>Usos:</strong> la mitad de las colecciones del catálogo, que no tienen arte editorial cargado.</p>`,
			},
		},
	},
};

export const AltoConstante: Story = {
	render: (args) => ({
		props: { ...args, representativeImagery, sampleImagery },
		template: `
			<div class="flex items-start gap-8">
				<cuentoneta-collection-cover [imagery]="representativeImagery" />
				<cuentoneta-collection-cover [imagery]="sampleImagery" />
			</div>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>Las dos formas, una al lado de la otra: cambian de ancho pero no de alto. Es la invariante que hace que una colección pueda pasar de una forma a la otra —o de su esqueleto a cualquiera de las dos— sin empujar lo que viene abajo.</p>`,
			},
		},
	},
};

export const SlotsVacios: Story = {
	render,
	args: {
		imagery: { kind: 'sample', images: [sampleImages[0], '', ''] },
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Un abanico con portadas faltantes no deja huecos: cada slot vacío cae en el marcador que <a href="./?path=/docs/componentes-v3-coverimage--docs" target="_top"><strong>CoverImage</strong></a> ya dibuja.</p>`,
			},
		},
	},
};

export const EnLosTresAnchos: Story = {
	render: (args) => ({
		props: { ...args, sampleImagery },
		template: `
			<div class="flex flex-col gap-6">
				<div class="w-91 border border-dashed border-neutral-300 p-2">
					<p class="pb-2 font-inter text-xs text-neutral-600">Columna del panel — 364 px</p>
					<cuentoneta-collection-cover [imagery]="sampleImagery" />
				</div>
				<div class="w-146 border border-dashed border-neutral-300 p-2">
					<p class="pb-2 font-inter text-xs text-neutral-600">Panel deslizable — 584 px</p>
					<cuentoneta-collection-cover [imagery]="sampleImagery" />
				</div>
				<div class="w-91 border border-dashed border-neutral-300 p-2">
					<p class="pb-2 font-inter text-xs text-neutral-600">Marco de la tarjeta — recorta y centra</p>
					<section class="flex h-48 items-end justify-center overflow-hidden rounded-xl bg-neutral-100 px-3">
						<cuentoneta-collection-cover [imagery]="sampleImagery" />
					</section>
				</div>
			</div>
		`,
	}),
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				story: `<p>El mismo abanico en los tres contextos donde se monta. La caja es fija, así que lo que cambia es el marco: la tarjeta lo recorta y lo centra dentro de su caja gris, y las dos columnas lo dejan a la izquierda.</p>`,
			},
		},
	},
};

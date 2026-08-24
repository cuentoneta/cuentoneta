import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';

import { absurdoTagMock, colaborativaTagMock, cuentoTagMock, surrealismoTagMock } from '@mocks/onoff-tags.mock';

import { CollectionFiltersComponent, type CollectionFacet } from './collection-filters.component';

const facet = (tag: CollectionFacet['tag'], count: number, selected = false): CollectionFacet => ({
	tag,
	count,
	selected,
});

const catalogo: readonly CollectionFacet[] = [
	facet(colaborativaTagMock, 8),
	facet(cuentoTagMock, 5),
	facet(surrealismoTagMock, 3),
	facet(absurdoTagMock, 1),
];

const meta: Meta<CollectionFiltersComponent> = {
	component: CollectionFiltersComponent,
	title: 'Componentes V3/CollectionFilters',
	render: (args) => ({
		props: args,
		template: `<div class="w-50"><cuentoneta-collection-filters ${argsToTemplate(args)} /></div>`,
	}),
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>La columna de filtros del catálogo, <strong>CollectionFilters</strong>. Es un componente de presentación: recibe las facetas ya calculadas y avisa qué etiqueta se tocó, sin decidir nada sobre el filtrado.</p><p>Los chips de lo elegido no son una entrada aparte: se derivan de las facetas marcadas como seleccionadas, así que no hay dos fuentes que puedan discrepar.</p><p>Lo único que decide por su cuenta es si el grupo de categorías está plegado, que es estado de presentación suyo.</p><p>Se usa en <a href="./?path=/docs/páginas-collectionspage--docs" target="_top"><strong>CollectionsPage</strong></a>, que calcula las facetas sobre las colecciones a la vista: de ahí que al elegir una etiqueta las demás bajen su número y las que no conviven con ella desaparezcan.</p></div>`,
			},
		},
	},
	argTypes: {
		facets: { name: 'Facetas', table: { type: { summary: 'readonly CollectionFacet[]' } } },
		toggled: { action: 'toggled' },
		cleared: { action: 'cleared' },
	},
};

export default meta;
type Story = StoryObj<CollectionFiltersComponent>;

export const Playground: Story = {
	args: { facets: catalogo },
	parameters: {
		docs: {
			description: {
				story: `<p>El panel con el control vivo. Los eventos salen por el panel de <strong>Actions</strong>: la etiqueta viaja entera en <code>toggled</code>, así que quien lo consume no tiene que resolver el slug contra nada.</p>`,
			},
		},
	},
};

export const SinFiltrosElegidos: Story = {
	args: { facets: catalogo },
	parameters: {
		docs: {
			description: {
				story: `<p>El estado de arranque: todas las categorías disponibles y nada elegido. Sin selección no hay chips ni acceso a limpiar, porque no habría qué limpiar.</p>`,
			},
		},
	},
};

export const ConFiltrosElegidos: Story = {
	args: {
		facets: [facet(colaborativaTagMock, 8, true), facet(surrealismoTagMock, 3, true), facet(cuentoTagMock, 2)],
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Con dos categorías elegidas aparecen sus chips y el acceso a limpiar todo. Los conteos son los del subconjunto que queda a la vista, no los del catálogo entero.</p><p><strong>Usos:</strong> evaluar cómo conviven los chips con el encabezado cuando el nombre de la etiqueta es largo.</p>`,
			},
		},
	},
};

export const UnaSolaCategoria: Story = {
	args: { facets: [facet(colaborativaTagMock, 8, true)] },
	parameters: {
		docs: {
			description: {
				story: `<p>El caso al que se llega filtrando por una categoría que no convive con ninguna otra: queda su propia faceta y nada más. Es el estado que hace visible por qué las facetas no pueden vaciar el listado.</p>`,
			},
		},
	},
};

export const CatalogoSinEtiquetas: Story = {
	args: { facets: [] },
	parameters: {
		docs: {
			description: {
				story: `<p>Sin etiquetas en el catálogo el grupo queda vacío, pero el encabezado se conserva: la columna no desaparece ni cambia de ancho.</p>`,
			},
		},
	},
};

import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';

import { createCollectionTeaser, type CollectionTeaser } from '@models/collection.model';
import type { Tag } from '@models/tag.model';
import { onoffCollectionTeasersMock } from '@mocks/onoff-collections.mock';
import { absurdoTagMock, colaborativaTagMock, cuentoTagMock, surrealismoTagMock } from '@mocks/onoff-tags.mock';

import { CollectionFiltersComponent } from './collection-filters.component';

// El corpus no reparte sus etiquetas de forma que se vean conteos distintos entre facetas, así que
// las colecciones se derivan del canon con la combinación que hace falta mirar.
const [canonical] = onoffCollectionTeasersMock;
const conEtiquetas = (slug: string, tags: readonly Tag[]): CollectionTeaser =>
	createCollectionTeaser({
		_id: `${canonical._id}-${slug}`,
		slug,
		title: slug,
		description: canonical.description,
		imagery: canonical.imagery,
		tags,
		config: canonical.config,
		mediaSources: canonical.mediaSources,
		count: canonical.count,
	});

const catalogo: readonly CollectionTeaser[] = [
	conEtiquetas('una', [colaborativaTagMock, surrealismoTagMock]),
	conEtiquetas('otra', [colaborativaTagMock, cuentoTagMock]),
	conEtiquetas('tercera', [colaborativaTagMock]),
	conEtiquetas('cuarta', [cuentoTagMock, absurdoTagMock]),
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
				component: `<div><p>La columna de filtros del catálogo, <strong>CollectionFilters</strong>. Cuenta las etiquetas de las colecciones que recibe y ofrece una faceta por cada una, con cuántas la llevan.</p><p>No decide nada sobre el filtrado: avisa qué etiqueta se tocó y quién lo consume resuelve qué hacer. La selección entra como dato, así que el panel nunca discrepa de lo que la página está mostrando.</p><p>Recibe las colecciones <strong>a la vista</strong>, no el catálogo entero: de ahí que al elegir una etiqueta las demás bajen su número y las que no conviven con ella desaparezcan. Como toda faceta ofrecida tiene al menos una colección detrás, no hay forma de vaciar el listado eligiendo filtros.</p><p>Los chips de lo elegido salen de las mismas facetas, y lo único que resuelve por su cuenta es si el grupo está plegado.</p><p>Se usa en <a href="./?path=/docs/páginas-collectionspage--docs" target="_top"><strong>CollectionsPage</strong></a>.</p></div>`,
			},
		},
	},
	argTypes: {
		collections: { name: 'Colecciones a la vista', table: { type: { summary: 'readonly CollectionTeaser[]' } } },
		selected: { name: 'Etiquetas elegidas', table: { type: { summary: 'readonly string[]' } } },
		toggled: { action: 'toggled' },
		cleared: { action: 'cleared' },
	},
};

export default meta;
type Story = StoryObj<CollectionFiltersComponent>;

export const Playground: Story = {
	args: { collections: catalogo, selected: [] },
	parameters: {
		docs: {
			description: {
				story: `<p>El panel con los controles vivos. Los eventos salen por el panel de <strong>Actions</strong>: la etiqueta viaja entera en <code>toggled</code>, así que quien escucha no tiene que resolver el slug contra nada.</p><p>Agregá una etiqueta a <strong>Etiquetas elegidas</strong> para ver cómo cambian los conteos y aparecen los chips.</p>`,
			},
		},
	},
};

export const SinFiltrosElegidos: Story = {
	args: { collections: catalogo, selected: [] },
	parameters: {
		docs: {
			description: {
				story: `<p>El estado de arranque: una faceta por etiqueta del catálogo y nada elegido. Sin selección no hay chips ni acceso a limpiar, porque no habría qué limpiar.</p>`,
			},
		},
	},
};

export const ConFiltrosElegidos: Story = {
	args: { collections: catalogo, selected: [colaborativaTagMock.slug, cuentoTagMock.slug] },
	parameters: {
		docs: {
			description: {
				story: `<p>Con dos etiquetas elegidas aparecen sus chips y el acceso a limpiar todo.</p><p><strong>Usos:</strong> evaluar cómo conviven los chips con el encabezado cuando el nombre de la etiqueta es largo, y cuándo pasan a una segunda línea.</p>`,
			},
		},
	},
};

export const UnaSolaColeccionALaVista: Story = {
	args: { collections: [catalogo[2]], selected: [colaborativaTagMock.slug] },
	parameters: {
		docs: {
			description: {
				story: `<p>Al que se llega filtrando por una etiqueta que no convive con ninguna otra: queda su propia faceta y nada más. Es el estado que hace visible por qué elegir filtros no puede vaciar el listado.</p>`,
			},
		},
	},
};

export const CatalogoSinEtiquetas: Story = {
	args: { collections: [], selected: [] },
	parameters: {
		docs: {
			description: {
				story: `<p>Sin colecciones que contar el grupo queda vacío, pero el encabezado se conserva: la columna no desaparece ni cambia de ancho.</p>`,
			},
		},
	},
};

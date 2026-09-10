import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';

import type { CollectionTeaser } from '@models/collection.model';
import type { Tag } from '@models/tag.model';
import { onoffCollectionTeasersMock, onoffCollectionTeasersWithoutTagsMock } from '@mocks/onoff-collections.mock';
import { colaborativaTagMock, ensayoTagMock } from '@mocks/onoff-tags.mock';

import { CollectionFiltersComponent } from './collection-filters.component';

const catalogue: readonly CollectionTeaser[] = onoffCollectionTeasersMock;

const countFor = (tag: Tag) =>
	catalogue.filter((collection) => collection.tags.some((candidate) => candidate.slug === tag.slug)).length;

// La etiqueta menos frecuente del catálogo, y el resultado de elegirla, calculados como los calcula la
// página. Nombrar una etiqueta puntual ataría la entrada a un reparto que el elenco puede cambiar.
const scarcestTag = catalogue
	.flatMap((collection) => collection.tags)
	.reduce((scarcest, tag) => (countFor(tag) < countFor(scarcest) ? tag : scarcest));

const carryingScarcestTag = catalogue.filter((collection) =>
	collection.tags.some((tag) => tag.slug === scarcestTag.slug),
);

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
	args: { collections: catalogue, selected: [] },
	parameters: {
		docs: {
			description: {
				story: `<p>El panel con los controles vivos. Los eventos salen por el panel de <strong>Actions</strong>: la etiqueta viaja entera en <code>toggled</code>, así que quien escucha no tiene que resolver el slug contra nada.</p><p>Agregá una etiqueta a <strong>Etiquetas elegidas</strong> para ver cómo cambian los conteos y aparecen los chips.</p>`,
			},
		},
	},
};

export const SinFiltrosElegidos: Story = {
	args: { collections: catalogue, selected: [] },
	parameters: {
		docs: {
			description: {
				story: `<p>El estado de arranque: una faceta por etiqueta del catálogo y nada elegido. Sin selección no hay chips ni acceso a limpiar, porque no habría qué limpiar.</p>`,
			},
		},
	},
};

export const ConFiltrosElegidos: Story = {
	args: { collections: catalogue, selected: [colaborativaTagMock.slug, ensayoTagMock.slug] },
	parameters: {
		docs: {
			description: {
				story: `<p>Con dos etiquetas elegidas aparecen sus chips y el acceso a limpiar todo.</p><p><strong>Usos:</strong> evaluar cómo conviven los chips con el encabezado cuando el nombre de la etiqueta es largo, y cuándo pasan a una segunda línea.</p>`,
			},
		},
	},
};

export const UnaSolaColeccionALaVista: Story = {
	args: { collections: carryingScarcestTag, selected: [scarcestTag.slug] },
	parameters: {
		docs: {
			description: {
				story: `<p>Al que se llega filtrando por la etiqueta menos frecuente del catálogo: quedan su faceta y las de las colecciones que sobreviven, y nada más. Es el estado que hace visible por qué elegir filtros no puede vaciar el listado.</p>`,
			},
		},
	},
};

export const ColeccionesSinEtiquetar: Story = {
	args: { collections: onoffCollectionTeasersWithoutTagsMock, selected: [] },
	parameters: {
		docs: {
			description: {
				story: `<p>Colecciones que existen pero no llevan ninguna etiqueta cargada: hay catálogo y no hay facetas que ofrecer. Se distingue del catálogo vacío en que las colecciones sí están; lo que falta es con qué clasificarlas.</p>`,
			},
		},
	},
};

export const SinColeccionesALaVista: Story = {
	args: { collections: [], selected: [] },
	parameters: {
		docs: {
			description: {
				story: `<p>Sin colecciones que contar el grupo queda vacío, pero el encabezado se conserva: la columna no desaparece ni cambia de ancho.</p>`,
			},
		},
	},
};

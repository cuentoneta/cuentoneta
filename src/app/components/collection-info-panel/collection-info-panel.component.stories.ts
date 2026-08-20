import { argsToTemplate, componentWrapperDecorator, Meta, StoryObj } from '@storybook/angular-vite';
import { CollectionInfoPanelComponent } from './collection-info-panel.component';
import {
	onoffCollectionsWithRepresentativeImageryMock,
	onoffCollectionsWithSampleImageryMock,
} from '@mocks/onoff-collections.mock';
import {
	absurdoTagMock,
	cuentoTagMock,
	ensayoTagMock,
	metaficcionTagMock,
	novelaTagMock,
	teatroTagMock,
} from '@mocks/onoff-tags.mock';
import { createCollection } from '@models/collection.model';

const [representativeCollection] = onoffCollectionsWithRepresentativeImageryMock;
const [sampleCollection] = onoffCollectionsWithSampleImageryMock;

// El corpus trae una etiqueta por colección: la variante se deriva por la factory, que es la que hace
// cumplir las invariantes del agregado.
const collectionWithManyTags = createCollection({
	...representativeCollection,
	tags: [cuentoTagMock, novelaTagMock, ensayoTagMock, teatroTagMock, metaficcionTagMock, absurdoTagMock],
});

const meta: Meta<CollectionInfoPanelComponent> = {
	title: 'Componentes V3/CollectionInfoPanel',
	component: CollectionInfoPanelComponent,
	parameters: {
		layout: 'centered',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El <strong>CollectionInfoPanelComponent</strong> del Design System v3 muestra la información de una colección en una columna: portada, título, etiquetas y descripción.</p><p>Existe porque la página de colección monta ese mismo bloque en <strong>dos lugares</strong> —la barra lateral y el panel deslizable de la descripción—, y tenerlo escrito dos veces garantiza que diverjan. Las diferencias entre los dos montajes se expresan como inputs: el deslizable oculta el título, que su encabezado ya nombra, y no recorta la descripción.</p><p>Se compone de <a href="./?path=/docs/componentes-v3-collectioncover--docs" target="_top"><strong>CollectionCover</strong></a> (la portada, en cualquiera de sus dos formas), <a href="./?path=/docs/componentes-v3-tagslist--docs" target="_top"><strong>TagsList</strong></a> y <a href="./?path=/docs/componentes-v3-tag--docs" target="_top"><strong>Tag</strong></a> (etiquetas en variante <code>filled</code>).</p><p>Cuántas líneas se muestran de la descripción lo decide quien lo monta, porque depende del alto disponible en su columna; sin ese dato el panel no recorta. La descripción llega saneada desde el backend y se pinta como HTML. Sin colección, dibuja su propio esqueleto, <strong>CollectionInfoPanelSkeleton</strong>.</p></div>`,
			},
		},
	},
	argTypes: {
		collection: {
			control: { type: 'object' },
			description: 'La colección a mostrar. Ausente, el panel dibuja su esqueleto',
			table: { type: { summary: 'Collection | undefined' } },
		},
		showTitle: {
			control: 'boolean',
			description: 'Muestra el título de la colección',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
		},
		descriptionLines: {
			control: { type: 'number', min: 1, max: 10 },
			description: 'Líneas visibles de la descripción. Sin valor, se muestra entera',
			table: { type: { summary: 'number | undefined' }, defaultValue: { summary: 'undefined' } },
		},
		priority: {
			control: 'boolean',
			description: 'Marca la portada como prioritaria, para cuando el panel entra above-the-fold',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
	},
	// La columna real de la página mide 364 px: fuera de ese ancho no se ve ni el recorte de la
	// descripción ni el de las etiquetas.
	decorators: [componentWrapperDecorator((story) => `<div class="w-91">${story}</div>`)],
};

export default meta;
type Story = StoryObj<CollectionInfoPanelComponent>;

export const Sidebar: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-collection-info-panel ${argsToTemplate(args)} />`,
	}),
	args: {
		collection: representativeCollection,
		descriptionLines: 8,
		priority: true,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>El montaje de la barra lateral: título visible, descripción recortada a ocho líneas y portada prioritaria, porque entra above-the-fold.</p><p><strong>Usos:</strong> columna de información de la página de colección.</p>`,
			},
		},
	},
};

export const Drawer: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-collection-info-panel ${argsToTemplate(args)} />`,
	}),
	args: {
		collection: representativeCollection,
		showTitle: false,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>El montaje del panel deslizable: sin título —su encabezado ya nombra la colección— y sin recorte, porque ahí la descripción se lee entera.</p><p><strong>Usos:</strong> contenido del panel que se abre al pedir "Leer más".</p>`,
			},
		},
	},
};

export const AbanicoDePortadas: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-collection-info-panel ${argsToTemplate(args)} />`,
	}),
	args: {
		collection: sampleCollection,
		descriptionLines: 8,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>La colección sin imagen propia resuelve su portada con el abanico de tres portadas de obras que contiene, que es la otra forma que declara el dominio.</p><p><strong>Usos:</strong> colecciones que no tienen una imagen editorial cargada.</p>`,
			},
		},
	},
};

export const VariasEtiquetas: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-collection-info-panel ${argsToTemplate(args)} />`,
	}),
	args: {
		collection: collectionWithManyTags,
		descriptionLines: 8,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Con varias etiquetas se ve el recorte de <a href="./?path=/docs/componentes-v3-tagslist--docs" target="_top"><strong>TagsList</strong></a>: en esta columna angosta las que no entran se colapsan detrás de un contador. Es la única superficie donde ese comportamiento se puede mirar — depende de medidas reales y el entorno de tests no las computa.</p><p><strong>Usos:</strong> colecciones clasificadas con más de una etiqueta.</p>`,
			},
		},
	},
};

export const Estados: StoryObj<CollectionInfoPanelComponent & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `<cuentoneta-collection-info-panel [collection]="loading ? undefined : collection" [descriptionLines]="descriptionLines" />`,
	}),
	args: {
		collection: representativeCollection,
		descriptionLines: 8,
		loading: true,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>El mismo slot alterna entre el panel y su esqueleto con el control <strong>Cargando</strong>: es la forma de comprobar que la sustitución no mueve el layout, que es para lo que el esqueleto existe.</p>`,
			},
		},
	},
};

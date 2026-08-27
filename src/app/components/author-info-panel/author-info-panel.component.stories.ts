import { argsToTemplate, componentWrapperDecorator, Meta, StoryObj } from '@storybook/angular-vite';
import { AuthorInfoPanelComponent } from './author-info-panel.component';
import { authorMock } from '@mocks/author.mock';
import {
	absurdoTagMock,
	cuentoTagMock,
	ensayoTagMock,
	metaficcionTagMock,
	novelaTagMock,
	teatroTagMock,
} from '@mocks/onoff-tags.mock';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

// El corpus trae una etiqueta por autor: sin varias, el recorte de TagsList no se puede mirar.
const authorWithManyTags = {
	...authorMock,
	tags: [cuentoTagMock, novelaTagMock, ensayoTagMock, teatroTagMock, metaficcionTagMock, absurdoTagMock],
};

// La biografía pasa por el mismo pipeline que la del backend, para que el HTML sea el real.
const authorWithShortBiography = {
	...authorMock,
	biography: markdownToSanitizedHtml(
		createMarkdown(
			'**François Onoff** (Lyon, 1948 - París, 1994) fue un escritor y editor francés, fundador de la editorial que lleva su apellido.',
		),
	),
};

const meta: Meta<AuthorInfoPanelComponent> = {
	title: 'Componentes V3/AuthorInfoPanel',
	component: AuthorInfoPanelComponent,
	parameters: {
		layout: 'centered',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El <strong>AuthorInfoPanelComponent</strong> del Design System v3 muestra el perfil de un autor en una columna: retrato, nombre, país, etiquetas y biografía.</p><p>Existe porque la página de autor monta ese mismo bloque en <strong>dos lugares</strong> —la barra lateral y el panel deslizable de la biografía—, y tenerlo escrito dos veces garantiza que diverjan. Las diferencias entre los dos montajes se expresan como inputs: el deslizable oculta el nombre, que su etiqueta accesible ya anuncia, y no recorta la biografía.</p><p>Se compone de <a href="./?path=/docs/componentes-v3-imageprofile--docs" target="_top"><strong>ImageProfile</strong></a> (el retrato, en tamaño <code>xl</code>), <a href="./?path=/docs/componentes-v3-tagslist--docs" target="_top"><strong>TagsList</strong></a> y <a href="./?path=/docs/componentes-v3-tag--docs" target="_top"><strong>Tag</strong></a> (etiquetas en variante <code>filled</code>).</p><p>El nombre se emite como encabezado de primer nivel: es el <code>h1</code> de la página de autor. Cuántas líneas se muestran de la biografía lo decide quien lo monta, porque depende del alto disponible en su columna; sin ese dato el panel no recorta. La biografía llega saneada desde el backend y se pinta como HTML. Sin autor, dibuja su propio esqueleto, <strong>AuthorInfoPanelSkeleton</strong>.</p></div>`,
			},
		},
	},
	argTypes: {
		author: {
			control: { type: 'object' },
			description: 'El autor a mostrar. Ausente, el panel dibuja su esqueleto',
			table: { type: { summary: 'Author | undefined' } },
		},
		showName: {
			control: 'boolean',
			description: 'Muestra el nombre del autor como encabezado de primer nivel',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
		},
		biographyLines: {
			control: { type: 'number', min: 1, max: 10 },
			description: 'Líneas visibles de la biografía. Sin valor, se muestra entera',
			table: { type: { summary: 'number | undefined' }, defaultValue: { summary: 'undefined' } },
		},
		showReadMore: {
			control: 'boolean',
			description: 'Ofrece el acceso a la biografía completa, si además desborda su recorte',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
	},
	// La columna real de la página mide 364 px: fuera de ese ancho no se ve ni el recorte de la
	// biografía ni el de las etiquetas.
	decorators: [componentWrapperDecorator((story) => `<div class="w-91">${story}</div>`)],
};

export default meta;
type Story = StoryObj<AuthorInfoPanelComponent>;

export const Sidebar: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-author-info-panel ${argsToTemplate(args)} />`,
	}),
	args: {
		author: authorMock,
		biographyLines: 8,
		showReadMore: true,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>El montaje de la barra lateral: nombre visible, biografía recortada a ocho líneas y el acceso a leerla completa, que aparece solo si el texto desborda ese recorte.</p><p><strong>Usos:</strong> columna de perfil de la página de autor.</p>`,
			},
		},
	},
};

export const Drawer: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-author-info-panel ${argsToTemplate(args)} />`,
	}),
	args: {
		author: authorMock,
		showName: false,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>El montaje del panel deslizable: sin nombre —su etiqueta accesible ya anuncia al autor, y un segundo <code>h1</code> con el mismo texto lo repetiría— y sin recorte, porque ahí la biografía se lee entera.</p><p>Es la única superficie donde se ve el ritmo vertical de la prosa: en la columna el recorte corta los párrafos antes de que la separación se note. La separación es una línea en blanco, la misma que dibuja el diseño. El HTML lo emite el pipeline de Markdown sin clases, así que la regla vive en una hoja global anclada al componente.</p><p><strong>Usos:</strong> contenido del panel que se abre al pedir "Leer más".</p>`,
			},
		},
	},
};

export const BiografiaCorta: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-author-info-panel ${argsToTemplate(args)} />`,
	}),
	args: {
		author: authorWithShortBiography,
		biographyLines: 8,
		showReadMore: true,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Una biografía que entra completa en su recorte: el acceso a leerla entera <strong>no aparece</strong>, porque no hay nada más que leer. Es el escenario que el diseño rotula "Few stories and info".</p><p>La medición depende del layout real, así que este comportamiento solo se puede mirar acá — el entorno de tests no computa alturas.</p>`,
			},
		},
	},
};

export const VariasEtiquetas: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-author-info-panel ${argsToTemplate(args)} />`,
	}),
	args: {
		author: authorWithManyTags,
		biographyLines: 8,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Con varias etiquetas se ve el recorte de <a href="./?path=/docs/componentes-v3-tagslist--docs" target="_top"><strong>TagsList</strong></a>: en esta columna angosta las que no entran se colapsan detrás de un contador. Es la única superficie donde ese comportamiento se puede mirar — depende de medidas reales y el entorno de tests no las computa.</p><p><strong>Usos:</strong> autores clasificados con más de una etiqueta.</p>`,
			},
		},
	},
};

export const Estados: StoryObj<AuthorInfoPanelComponent & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `<cuentoneta-author-info-panel [author]="loading ? undefined : author" [biographyLines]="biographyLines" />`,
	}),
	args: {
		author: authorMock,
		biographyLines: 8,
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

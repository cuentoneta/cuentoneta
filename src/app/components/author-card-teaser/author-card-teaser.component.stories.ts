import { argsToTemplate, componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';

import { AuthorCardTeaserComponent } from './author-card-teaser.component';
import { AuthorCardTeaserSkeletonComponent } from './author-card-teaser-skeleton.component';
import { authorTeaserMock } from '@mocks/author.mock';
import { onoffTagsMock } from '@mocks/onoff-tags.mock';

const tags = onoffTagsMock.slice(0, 2);

// Autor con más de 2 tags para ejercitar el recorte por ancho de la fila de tags.
const manyTags = onoffTagsMock.slice(0, 4);

const meta: Meta<AuthorCardTeaserComponent> = {
	component: AuthorCardTeaserComponent,
	title: 'Componentes V3/AuthorCardTeaser',
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div><p>El componente <strong>AuthorCardTeaserComponent</strong> muestra una vista previa de un autor enlazada a su perfil, según el Design System v3. Está pensado para listar y visualizar perfiles de autores, mostrando el avatar, los tags, el nombre con la bandera de nacionalidad y la cantidad de historias.</p><p>Se modela como un <code>&lt;article&gt;</code> con un único enlace real sobre el nombre del autor, estirado con un pseudo-elemento para que toda la tarjeta sea clickeable sin inflar el nombre accesible del link.</p><p>Se compone de <a href="./?path=/docs/componentes-v3-imageprofile--docs" target="_top"><strong>ImageProfile</strong></a> (avatar) y <a href="./?path=/docs/componentes-v3-tagslist--docs" target="_top"><strong>TagsList</strong></a> con instancias de <a href="./?path=/docs/componentes-v3-tag--docs" target="_top"><strong>Tag</strong></a> (etiquetas del autor).</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		author: {
			control: { type: 'object' },
			description: 'Datos del autor (slug, nombre, imageUrl, nacionalidad)',
			table: { type: { summary: 'AuthorTeaser' }, defaultValue: { summary: 'required' } },
		},
		tags: {
			control: { type: 'object' },
			description: 'Tags asociados al autor',
			table: { type: { summary: 'readonly Tag[]' }, defaultValue: { summary: '[]' } },
		},
		storyCount: {
			control: { type: 'number' },
			description: 'Cantidad de historias del autor',
			table: { type: { summary: 'number' }, defaultValue: { summary: 'undefined' } },
		},
	},
};

export default meta;
type Story = StoryObj<AuthorCardTeaserComponent>;

export const Default: Story = {
	name: 'Por defecto',
	render: (args) => ({ props: args, template: `<cuentoneta-author-card-teaser ${argsToTemplate(args)} />` }),
	args: { author: authorTeaserMock, tags, storyCount: 21 },
	parameters: {
		docs: {
			description: {
				story: `<p>Teaser completo del autor: avatar, fila de tags, nombre con bandera de nacionalidad y cantidad de historias. Toda la tarjeta es clickeable y navega al perfil del autor.</p><p><strong>Usos:</strong> la sección <a href="./?path=/docs/componentes-v3-highlightedauthors--docs" target="_top"><strong>HighlightedAuthors</strong></a> de la página de inicio, y el listado de autores.</p>`,
			},
		},
	},
};

export const ManyTags: Story = {
	name: 'Muchos tags',
	render: (args) => ({ props: args, template: `<cuentoneta-author-card-teaser ${argsToTemplate(args)} />` }),
	args: { author: authorTeaserMock, tags: manyTags, storyCount: 35 },
	decorators: [componentWrapperDecorator((story) => `<div style="width:320px">${story}</div>`)],
	parameters: {
		docs: {
			description: {
				story: `<p>Autor con varios tags en un contenedor acotado de 320px: los que no entran se recortan por ancho y colapsan tras un contador "+N".</p><p><strong>Usos:</strong> Author List, en columnas angostas o viewports reducidos donde la fila de tags no entra completa.</p>`,
			},
		},
	},
};

export const WithoutImage: Story = {
	name: 'Sin imagen',
	render: (args) => ({ props: args, template: `<cuentoneta-author-card-teaser ${argsToTemplate(args)} />` }),
	args: { author: { ...authorTeaserMock, imageUrl: '' }, tags, storyCount: 21 },
	parameters: {
		docs: {
			description: {
				story: `<p>Autor sin imagen: el avatar cae al placeholder circular del Design System que resuelve <a href="./?path=/docs/componentes-v3-imageprofile--docs" target="_top"><strong>ImageProfile</strong></a>.</p><p><strong>Usos:</strong> Author List, para autores cuyo perfil todavía no tiene retrato cargado en el CMS.</p>`,
			},
		},
	},
};

export const Skeleton: StoryObj = {
	name: 'Esqueleto',
	decorators: [moduleMetadata({ imports: [AuthorCardTeaserSkeletonComponent] })],
	render: () => ({ template: `<cuentoneta-author-card-teaser-skeleton />` }),
	parameters: {
		docs: { description: { story: 'Skeleton de carga del teaser.' } },
	},
};

export const Estados: StoryObj<AuthorCardTeaserComponent & { loading: boolean }> = {
	decorators: [moduleMetadata({ imports: [AuthorCardTeaserSkeletonComponent] })],
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			<div class="w-[320px]">
				@if (loading) {
					<cuentoneta-author-card-teaser-skeleton />
				} @else {
					<cuentoneta-author-card-teaser [author]="author" [tags]="tags" [storyCount]="storyCount" />
				}
			</div>
		`,
	}),
	args: { loading: true, author: authorTeaserMock, tags, storyCount: 21 },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

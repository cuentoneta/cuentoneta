import {
	applicationConfig,
	argsToTemplate,
	componentWrapperDecorator,
	Meta,
	moduleMetadata,
	StoryObj,
} from '@storybook/angular';
import { provideRouter } from '@angular/router';

import { AuthorTeaserV3Component } from './author-teaser-v3.component';
import { AuthorTeaserV3SkeletonComponent } from './author-teaser-v3-skeleton.component';
import { authorTeaserMock } from '../../mocks/author.mock';
import { Tag } from '@models/tag.model';

const tags: Tag[] = [
	{ title: 'Surrealismo', slug: 'surrealismo', shortDescription: '', description: [] },
	{ title: 'Fantástico', slug: 'fantastico', shortDescription: '', description: [] },
];

// Autor con más de 2 tags (ejemplo de Eduardo Galeano en el diseño v3).
const galeanoMock = { ...authorTeaserMock, name: 'Eduardo Galeano' };
const galeanoTags: Tag[] = [
	{ title: 'Crónica', slug: 'cronica', shortDescription: '', description: [] },
	{ title: 'Ensayo', slug: 'ensayo', shortDescription: '', description: [] },
	{ title: 'Memoria', slug: 'memoria', shortDescription: '', description: [] },
	{ title: 'Histórico', slug: 'historico', shortDescription: '', description: [] },
];

const meta: Meta<AuthorTeaserV3Component> = {
	component: AuthorTeaserV3Component,
	title: 'Componentes V3/AuthorTeaserV3',
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
	],
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div><p>El componente <strong>AuthorTeaserV3Component</strong> muestra una vista previa de un autor enlazada a su perfil, según el Design System v3. Está pensado para listar y visualizar perfiles de autores, mostrando el avatar, los tags, el nombre con la bandera de nacionalidad y la cantidad de historias.</p><p>Se modela como un <code>&lt;article&gt;</code> con un único enlace real sobre el nombre del autor, estirado con un pseudo-elemento para que toda la tarjeta sea clickeable sin inflar el nombre accesible del link.</p><p>Se compone de <a href="./?path=/docs/componentes-v3-imageprofile--docs" target="_top"><strong>ImageProfile</strong></a> (avatar) y <a href="./?path=/docs/componentes-v3-tagslist--docs" target="_top"><strong>TagsList</strong></a> con instancias de <a href="./?path=/docs/componentes-v3-tag--docs" target="_top"><strong>Tag</strong></a> (etiquetas del autor).</p></div>`,
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
			table: { type: { summary: 'Tag[]' }, defaultValue: { summary: '[]' } },
		},
		storyCount: {
			control: { type: 'number' },
			description: 'Cantidad de historias del autor',
			table: { type: { summary: 'number' }, defaultValue: { summary: 'undefined' } },
		},
	},
};

export default meta;
type Story = StoryObj<AuthorTeaserV3Component>;

// Teaser completo: avatar, tags, nombre + bandera y cantidad de historias.
export const Default: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-author-teaser-v3 ${argsToTemplate(args)} />` }),
	args: { author: authorTeaserMock, tags, storyCount: 21 },
	parameters: {
		docs: {
			description: {
				story: `<p>Teaser completo del autor: avatar, fila de tags, nombre con bandera de nacionalidad y cantidad de historias. Toda la tarjeta es clickeable y navega al perfil del autor.</p><p><strong>Usos:</strong> Author List (listado de autores).</p>`,
			},
		},
	},
};

// Más de 2 tags en un contenedor acotado: la fila de tags se recorta por ancho y colapsa el excedente
// tras un contador "+N" (ejemplo: Eduardo Galeano).
export const ManyTags: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-author-teaser-v3 ${argsToTemplate(args)} />` }),
	args: { author: galeanoMock, tags: galeanoTags, storyCount: 35 },
	decorators: [componentWrapperDecorator((story) => `<div style="width:320px">${story}</div>`)],
	parameters: {
		docs: {
			description: {
				story: `<p>Autor con varios tags en un contenedor acotado de 320px: los que no entran se recortan por ancho y colapsan tras un contador "+N" (ejemplo: Eduardo Galeano).</p><p><strong>Usos:</strong> Author List, en columnas angostas o viewports reducidos donde la fila de tags no entra completa.</p>`,
			},
		},
	},
};

// Sin imagen: el avatar cae al placeholder circular.
export const WithoutImage: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-author-teaser-v3 ${argsToTemplate(args)} />` }),
	args: { author: { ...authorTeaserMock, imageUrl: '' }, tags, storyCount: 21 },
	parameters: {
		docs: {
			description: {
				story: `<p>Autor sin imagen: el avatar cae al placeholder circular del Design System que resuelve <a href="./?path=/docs/componentes-v3-imageprofile--docs" target="_top"><strong>ImageProfile</strong></a>.</p><p><strong>Usos:</strong> Author List, para autores cuyo perfil todavía no tiene retrato cargado en el CMS.</p>`,
			},
		},
	},
};

// Estado de carga (skeleton) del teaser.
export const Skeleton: StoryObj = {
	decorators: [moduleMetadata({ imports: [AuthorTeaserV3SkeletonComponent] })],
	render: () => ({ template: `<cuentoneta-author-teaser-v3-skeleton />` }),
	parameters: {
		docs: { description: { story: 'Skeleton de carga del teaser.' } },
	},
};

// Switch "Cargando" para alternar real↔skeleton en el mismo slot y evaluar la transición/alineación.
export const Estados: StoryObj<AuthorTeaserV3Component & { loading: boolean }> = {
	decorators: [moduleMetadata({ imports: [AuthorTeaserV3SkeletonComponent] })],
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			<div class="w-[320px]">
				@if (loading) {
					<cuentoneta-author-teaser-v3-skeleton />
				} @else {
					<cuentoneta-author-teaser-v3 [author]="author" [tags]="tags" [storyCount]="storyCount" />
				}
			</div>
		`,
	}),
	args: { loading: true, author: authorTeaserMock, tags, storyCount: 21 },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

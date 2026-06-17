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
	title: 'Componentes/AuthorTeaserV3',
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
				component: `<div>
					<p>El componente **AuthorTeaserV3Component** muestra una vista previa de un autor enlazada a su perfil,
					según el Design System v3. Está pensado para listar y visualizar perfiles de autores, mostrando el
					avatar (80px), los tags, el nombre + bandera de nacionalidad y la cantidad de historias.</p>
				</div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		author: { control: { type: 'object' }, description: 'Datos del autor (slug, nombre, imageUrl, nacionalidad)' },
		tags: { control: { type: 'object' }, description: 'Tags asociados al autor' },
		storyCount: { control: { type: 'number' }, description: 'Cantidad de historias del autor' },
	},
};

export default meta;
type Story = StoryObj<AuthorTeaserV3Component>;

// Teaser completo: avatar, tags, nombre + bandera y cantidad de historias.
export const Default: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-author-teaser-v3 ${argsToTemplate(args)} />` }),
	args: { author: authorTeaserMock, tags, storyCount: 21 },
	parameters: {
		docs: { description: { story: 'Teaser completo del autor.' } },
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
				story: 'Autor con varios tags en un contenedor de 320px: los que no entran se colapsan tras un contador "+N".',
			},
		},
	},
};

// Sin imagen: el avatar cae al placeholder circular.
export const WithoutImage: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-author-teaser-v3 ${argsToTemplate(args)} />` }),
	args: { author: { ...authorTeaserMock, imageUrl: '' }, tags, storyCount: 21 },
	parameters: {
		docs: { description: { story: 'Autor sin imagen: avatar con placeholder.' } },
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

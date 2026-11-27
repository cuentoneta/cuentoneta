import type { Meta, StoryObj } from '@storybook/angular-vite';
import { argsToTemplate } from '@storybook/angular-vite';

import { LiteraryWorkHeroHeader } from './literary-work-hero-header';
import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { literaryWorkSelectArgType } from '@mocks/onoff-corpus.storybook';
import { secondAuthorMock } from '@mocks/author.mock';
import { coverImageDocs } from '@components/cover-image/cover-image.docs';
import { tagsListDocs } from '@components/tags-list/tags-list.docs';
import { authorsBylineDocs } from '@components/authors-byline/authors-byline.docs';
import { docsRef } from '@testing/storybook-docs';

// Obra representativa del canon para las stories que solo necesitan una cualquiera.
const [literaryWorkMock] = onoffLiteraryWorksMock;

const meta: Meta<LiteraryWorkHeroHeader> = {
	component: LiteraryWorkHeroHeader,
	title: 'Componentes V3/LiteraryWorkHeroHeader',
	tags: ['autodocs'],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Banda superior (hero) de la página de una obra. Usa la misma portada de la obra como fondo difuminado con una capa de opacidad y, en primer plano, presenta la portada nítida, los tags, el/los autor(es), el título y la colección/año de publicación originales.</p><p>El fondo no es otra imagen: es la misma <code>coverImage</code> pedida al CDN en una talla mayor (1920px de ancho) para cubrir el ancho completo del hero.</p><p>Recibe la <code>LiteraryWork</code> completa como único input; cuando no se provee, renderiza su propio estado de carga (skeleton).</p><p>Se compone de ${docsRef(coverImageDocs)} (portada en primer plano), ${docsRef(tagsListDocs)} (tags de la obra, variante <code>gray</code>) y ${docsRef(authorsBylineDocs)} (avatar y nombre de los autores, en tema <code>on-dark</code>).</p></div>`,
			},
		},
		layout: 'fullscreen',
	},
	argTypes: {
		literaryWork: {
			control: { type: 'object' },
			description: 'Obra completa a partir de la cual se derivan portada, tags, autor, título y publicación',
			table: { type: { summary: 'LiteraryWork' }, defaultValue: { summary: 'undefined' } },
		},
	},
};

export default meta;
type Story = StoryObj<LiteraryWorkHeroHeader>;

export const Interactiva: StoryObj<LiteraryWorkHeroHeader & { literaryWorkIndex: number }> = {
	argTypes: {
		literaryWorkIndex: {
			...literaryWorkSelectArgType,
			description:
				'Obra del corpus de François Onoff; su portada, título, autor y publicación cambian de forma conjunta',
		},
	},
	render: (args) => ({
		props: { ...args, literaryWorks: onoffLiteraryWorksMock },
		template: `<cuentoneta-literary-work-hero-header [literaryWork]="literaryWorks[literaryWorkIndex]" />`,
	}),
	args: { literaryWorkIndex: 0 },
	parameters: {
		docs: {
			description: {
				story:
					'Playground interactivo. Elegí la <strong>Obra</strong> del corpus: su portada de fondo, título, autor y publicación cambian de forma conjunta.',
			},
		},
	},
};

export const Default: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-literary-work-hero-header ${argsToTemplate(args)} />`,
	}),
	args: { literaryWork: literaryWorkMock },
	parameters: {
		docs: {
			description: {
				story: 'Estado principal del hero con portada, tags, autor, título y publicación.',
			},
		},
	},
};

// El corpus de Onoff es de autoría única; el segundo autor es un fixture sintético ajeno al canon,
// que existe solo para mostrar este caso.
export const VariosAutores: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-literary-work-hero-header ${argsToTemplate(args)} />`,
	}),
	args: { literaryWork: { ...literaryWorkMock, authors: [...literaryWorkMock.authors, secondAuthorMock] } },
	parameters: {
		docs: {
			description: {
				story:
					'Obra con más de un autor: cada nombre enlaza a su propio perfil, unidos con la conjunción del idioma ("A y B"). El avatar sigue mostrando solo al primer autor.',
			},
		},
	},
};

// El hero renderiza su propio skeleton cuando no recibe la obra, así que basta una única instancia.
export const Estados: StoryObj<LiteraryWorkHeroHeader & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `<cuentoneta-literary-work-hero-header [literaryWork]="loading ? undefined : literaryWork" />`,
	}),
	args: { loading: true, literaryWork: literaryWorkMock },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

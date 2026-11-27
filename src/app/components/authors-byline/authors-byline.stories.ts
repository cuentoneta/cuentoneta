import type { Meta, StoryObj } from '@storybook/angular-vite';
import { argsToTemplate } from '@storybook/angular-vite';

import { AuthorsByline } from './authors-byline';
import { embeddedAuthorTeaserMock, secondAuthorTeaserMock } from '@mocks/author.mock';
import { imageProfileDocs } from '@components/image-profile/image-profile.docs';
import { docsRef } from '@testing/storybook-docs';

const [author, secondAuthor] = [embeddedAuthorTeaserMock, secondAuthorTeaserMock];
const thirdAuthor = { ...secondAuthor, slug: 'tercer-autor', name: 'Tercer Autor' };

const meta: Meta<AuthorsByline> = {
	component: AuthorsByline,
	title: 'Componentes V3/AuthorsByline',
	tags: ['autodocs'],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Bloque de autor(es) de una obra del Design System v3: el avatar del primer autor y el/los nombre(s), cada uno con su propio enlace accesible a <code>/author/:slug</code>, unidos con la conjunción del idioma ("A y B", "A, B y C").</p><p>Reutilizado por el hero, la card-teaser y la home-card-teaser de una obra. El avatar muestra solo al primer autor: con N autores no hay una foto "representativa" del grupo.</p><p>Se compone de ${docsRef(imageProfileDocs)} (avatar).</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		theme: {
			control: { type: 'inline-radio' },
			options: ['on-light', 'on-dark'],
			description: 'Tema visual del nombre: on-light (fondos claros) u on-dark (el hero)',
			table: { type: { summary: "'on-light' | 'on-dark'" }, defaultValue: { summary: 'on-light' } },
		},
	},
};

export default meta;
type Story = StoryObj<AuthorsByline>;

export const UnSoloAutor: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-authors-byline ${argsToTemplate(args)} />` }),
	args: { authors: [author], theme: 'on-light' },
	parameters: {
		docs: { description: { story: 'Caso mayoritario del corpus: un único autor, con avatar y enlace a su perfil.' } },
	},
};

// El corpus de Onoff es de autoría única; el segundo y tercer autor son fixtures sintéticos ajenos al
// canon, que existen solo para mostrar estos casos.
export const DosAutores: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-authors-byline ${argsToTemplate(args)} />` }),
	args: { authors: [author, secondAuthor], theme: 'on-light' },
	parameters: {
		docs: {
			description: {
				story:
					'Dos autores: cada nombre enlaza a su propio perfil, unidos con "y". El avatar sigue siendo el del primero.',
			},
		},
	},
};

export const TresOMasAutores: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-authors-byline ${argsToTemplate(args)} />` }),
	args: { authors: [author, secondAuthor, thirdAuthor], theme: 'on-light' },
	parameters: {
		docs: {
			description: { story: 'Tres autores: se separan con comas y el último se une con "y".' },
		},
	},
};

export const SobreFondoOscuro: Story = {
	render: (args) => ({
		props: args,
		template: `<div class="bg-neutral-900 p-6"><cuentoneta-authors-byline ${argsToTemplate(args)} /></div>`,
	}),
	args: { authors: [author, secondAuthor], theme: 'on-dark' },
	parameters: {
		docs: { description: { story: 'Tema `on-dark`, usado por el hero sobre su fondo oscuro.' } },
	},
};

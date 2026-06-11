import { applicationConfig, argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';

import { AuthorTeaserV3Component } from './author-teaser-v3.component';
import { authorTeaserMock } from '../../mocks/author.mock';

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
			description: {
				component: `<div>
					<p>El componente **AuthorTeaserV3Component** muestra una vista previa de un autor (avatar + nombre)
					enlazada a su perfil, según el Design System v3. Es un componente de presentación reutilizable
					(p. ej. por StoryCardTeaserV3). Encapsula el enlace, el avatar con su placeholder y el redimensionado
					de la imagen.</p>
				</div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		author: {
			control: { type: 'object' },
			description: 'Datos del autor (slug, nombre, imageUrl)',
		},
	},
};

export default meta;
type Story = StoryObj<AuthorTeaserV3Component>;

// Autor con imagen de avatar.
export const Default: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-author-teaser-v3 ${argsToTemplate(args)} />` }),
	args: { author: authorTeaserMock },
	parameters: {
		docs: { description: { story: 'Autor con avatar e imagen disponible.' } },
	},
};

// Autor sin imagen: se muestra el placeholder circular.
export const WithoutImage: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-author-teaser-v3 ${argsToTemplate(args)} />` }),
	args: { author: { ...authorTeaserMock, imageUrl: '' } },
	parameters: {
		docs: { description: { story: 'Autor sin imagen: el avatar cae al placeholder circular.' } },
	},
};

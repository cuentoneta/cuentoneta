import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';

import { ImageProfileComponent } from './image-profile.component';
import { authorTeaserMock } from '../../mocks/author.mock';

// Foto de muestra: François Onoff, nuestro "autor de stock" para Storybook, mocks y tests
// (misma foto que usa AuthorTeaser, tomada del mock para mantener una única fuente de verdad).
const src = authorTeaserMock.imageUrl;
const alt = `Retrato de ${authorTeaserMock.name}`;

const meta: Meta<ImageProfileComponent> = {
	component: ImageProfileComponent,
	title: 'Componentes/ImageProfile',
	parameters: {
		docs: {
			description: {
				component: `<div>
					<p>El componente **ImageProfileComponent** es la foto de perfil circular del Design System v3, usada para
					mostrar la imagen de autores (y, a futuro, de usuarios logueados). Es el componente más anidado del árbol
					de teasers v3.</p>
					<ul>
						<li><code>size</code>: small (24px), medium (40px), large (120px).</li>
						<li><code>src</code>/<code>alt</code>: foto del perfil. Sin <code>src</code> se muestra el placeholder de persona.</li>
						<li><code>variant</code>: <code>profile</code> (default) o <code>collection</code> (fondo brand-100 + ícono de biblioteca).</li>
					</ul>
					<p>Encapsula el redimensionado de la imagen (solicita al CDN 2× del tamaño de display).</p>
				</div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		size: {
			control: { type: 'inline-radio' },
			options: ['small', 'medium', 'large'],
			table: { defaultValue: { summary: 'medium' } },
		},
		variant: {
			control: { type: 'inline-radio' },
			options: ['profile', 'collection'],
			table: { defaultValue: { summary: 'profile' } },
		},
		src: { control: { type: 'text' } },
		alt: { control: { type: 'text' } },
	},
};

export default meta;
type Story = StoryObj<ImageProfileComponent>;

// Playground.
export const Default: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-image-profile ${argsToTemplate(args)} />` }),
	args: { src, alt, size: 'medium', variant: 'profile' },
};

// Placeholder (sin imagen).
export const Placeholder: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-image-profile ${argsToTemplate(args)} />` }),
	args: { size: 'medium', variant: 'profile' },
	parameters: { docs: { description: { story: 'Sin `src`: placeholder de persona sobre fondo gris.' } } },
};

// Variante Collections.
export const Collection: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-image-profile ${argsToTemplate(args)} />` }),
	args: { size: 'medium', variant: 'collection' },
	parameters: { docs: { description: { story: 'Variante collection: fondo brand-100 + ícono de biblioteca.' } } },
};

// Vitrina de tamaños y estados.
export const Showcase: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="flex flex-col gap-8">
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">Foto — small / medium / large</h3>
					<div class="flex items-end gap-4">
						<cuentoneta-image-profile [src]="src" [alt]="alt" size="small" />
						<cuentoneta-image-profile [src]="src" [alt]="alt" size="medium" />
						<cuentoneta-image-profile [src]="src" [alt]="alt" size="large" />
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">Placeholder — small / medium / large</h3>
					<div class="flex items-end gap-4">
						<cuentoneta-image-profile size="small" />
						<cuentoneta-image-profile size="medium" />
						<cuentoneta-image-profile size="large" />
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">Collection — small / medium / large</h3>
					<div class="flex items-end gap-4">
						<cuentoneta-image-profile variant="collection" size="small" />
						<cuentoneta-image-profile variant="collection" size="medium" />
						<cuentoneta-image-profile variant="collection" size="large" />
					</div>
				</div>
			</div>
		`,
	}),
	args: { src, alt },
	parameters: { docs: { description: { story: 'Todos los tamaños y estados (foto, placeholder, collection).' } } },
};

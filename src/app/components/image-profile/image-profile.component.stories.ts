import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';

import { ImageProfileComponent } from './image-profile.component';
import { authorTeaserMock } from '../../mocks/author.mock';

// Foto de muestra: François Onoff, nuestro "autor de stock" para Storybook, mocks y tests
// (misma foto que usa AuthorTeaser, tomada del mock para mantener una única fuente de verdad).
const src = authorTeaserMock.imageUrl;
const alt = `Retrato de ${authorTeaserMock.name}`;

const meta: Meta<ImageProfileComponent> = {
	component: ImageProfileComponent,
	title: 'Componentes V3/ImageProfile',
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div><p>El componente <strong>ImageProfileComponent</strong> es la foto de perfil circular del Design System v3, usada para mostrar la imagen de autores (y, a futuro, de usuarios logueados). Es el componente más anidado del árbol de teasers v3. Encapsula el recorte circular, el placeholder y el redimensionado de la imagen (solicita al CDN 2× del tamaño de display).</p><ul><li><code>size</code>: small (24px), medium (40px), lg (80px), xl (120px).</li><li><code>src</code>/<code>alt</code>: foto del perfil. Sin <code>src</code> se muestra el placeholder de persona.</li><li><code>variant</code>: <code>profile</code> (default) o <code>collection</code> (fondo brand-100 + ícono de biblioteca).</li></ul><p>Se consume desde <a href="./?path=/docs/componentes-v3-authorteaserv3--docs" target="_top"><strong>AuthorTeaserV3</strong></a>, <a href="./?path=/docs/componentes-v3-homestorycard--docs" target="_top"><strong>HomeStoryCard</strong></a> y <a href="./?path=/docs/componentes-v3-storycardteaserv3--docs" target="_top"><strong>StoryCardTeaserV3</strong></a> como avatar del autor.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		size: {
			control: { type: 'inline-radio' },
			options: ['small', 'medium', 'lg', 'xl'],
			description: 'Tamaño del avatar: small (24px), medium (40px), lg (80px), xl (120px)',
			table: { type: { summary: "'small' | 'medium' | 'lg' | 'xl'" }, defaultValue: { summary: 'medium' } },
		},
		variant: {
			control: { type: 'inline-radio' },
			options: ['profile', 'collection'],
			description:
				'Variante: profile (foto/placeholder de persona) o collection (fondo brand-100 + ícono de biblioteca)',
			table: { type: { summary: "'profile' | 'collection'" }, defaultValue: { summary: 'profile' } },
		},
		src: {
			control: { type: 'text' },
			description: 'URL de la foto; sin valor se muestra el placeholder de persona',
			table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
		},
		alt: {
			control: { type: 'text' },
			description: 'Texto alternativo de la imagen',
			table: { type: { summary: 'string' }, defaultValue: { summary: "''" } },
		},
	},
};

export default meta;
type Story = StoryObj<ImageProfileComponent>;

// Playground.
export const Default: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-image-profile ${argsToTemplate(args)} />` }),
	args: { src, alt, size: 'medium', variant: 'profile' },
	parameters: {
		docs: {
			description: {
				story: `<p>Playground interactivo: ajustá tamaño, variante, foto y texto alternativo desde los controles.</p><p><strong>Usos:</strong> referencia para integrar el avatar dentro de teasers y tarjetas.</p>`,
			},
		},
	},
};

// Placeholder (sin imagen).
export const Placeholder: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-image-profile ${argsToTemplate(args)} />` }),
	args: { size: 'medium', variant: 'profile' },
	parameters: {
		docs: {
			description: {
				story: `<p>Sin <code>src</code>: placeholder de persona sobre fondo gris.</p><p><strong>Usos:</strong> autores cuyo perfil todavía no tiene retrato cargado en el CMS.</p>`,
			},
		},
	},
};

// Variante Collections.
export const Collection: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-image-profile ${argsToTemplate(args)} />` }),
	args: { size: 'medium', variant: 'collection' },
	parameters: {
		docs: {
			description: {
				story: `<p>Variante collection: fondo brand-100 + ícono de biblioteca, en lugar de una foto.</p><p><strong>Usos:</strong> representación de una colección (storylist) donde no aplica un retrato de persona.</p>`,
			},
		},
	},
};

// Vitrina de tamaños y estados.
export const Showcase: Story = {
	render: (args) => ({
		props: args,
		template: `
			<div class="flex flex-col gap-8">
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">Foto — small / medium / lg / xl</h3>
					<div class="flex items-end gap-4">
						<cuentoneta-image-profile [src]="src" [alt]="alt" size="small" />
						<cuentoneta-image-profile [src]="src" [alt]="alt" size="medium" />
						<cuentoneta-image-profile [src]="src" [alt]="alt" size="lg" />
						<cuentoneta-image-profile [src]="src" [alt]="alt" size="xl" />
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">Placeholder — small / medium / lg / xl</h3>
					<div class="flex items-end gap-4">
						<cuentoneta-image-profile size="small" />
						<cuentoneta-image-profile size="medium" />
						<cuentoneta-image-profile size="lg" />
						<cuentoneta-image-profile size="xl" />
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">Collection — small / medium / lg / xl</h3>
					<div class="flex items-end gap-4">
						<cuentoneta-image-profile variant="collection" size="small" />
						<cuentoneta-image-profile variant="collection" size="medium" />
						<cuentoneta-image-profile variant="collection" size="lg" />
						<cuentoneta-image-profile variant="collection" size="xl" />
					</div>
				</div>
			</div>
		`,
	}),
	args: { src, alt },
	parameters: {
		docs: {
			description: {
				story: `<p>Todos los tamaños y estados (foto, placeholder, collection) en simultáneo.</p><p><strong>Usos:</strong> referencia visual de la escala de tamaños del avatar.</p>`,
			},
		},
	},
};

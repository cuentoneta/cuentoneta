import {
	applicationConfig,
	argsToTemplate,
	componentWrapperDecorator,
	Meta,
	moduleMetadata,
	StoryObj,
} from '@storybook/angular';
import { provideRouter } from '@angular/router';

import { NavigableCollectionTeaserComponent } from './navigable-collection-teaser.component';
import { NavigableCollectionTeaserSkeletonComponent } from './navigable-collection-teaser-skeleton.component';
import { storylistTeaserRepresentativeMock } from '@mocks/storylist.mock';

const meta: Meta<NavigableCollectionTeaserComponent> = {
	component: NavigableCollectionTeaserComponent,
	title: 'Componentes V3/NavigableCollectionTeaser',
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
	],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El componente <strong>NavigableCollectionTeaserComponent</strong> es el item compacto y navegable de una colección (Design System v3): ícono de biblioteca, nombre, categoría y cantidad de historias. Pensado para listas como «Otras colecciones sugeridas» del sidebar de la página de una colección.</p><p>Se modela como un <code>&lt;article&gt;</code> con un único enlace real sobre el nombre, estirado con un pseudo-elemento para que toda la tarjeta sea clickeable sin inflar el nombre accesible del link.</p><p>Se compone de <a href="./?path=/docs/componentes-v3-imageprofile--docs" target="_top"><strong>ImageProfile</strong></a> (ícono de colección, variante <code>collection</code>) y <a href="./?path=/docs/componentes-v3-tag--docs" target="_top"><strong>Tag</strong></a> (categoría, variante <code>soft</code>).</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		collection: {
			control: { type: 'object' },
			description: 'Teaser de la colección (title, slug, count, tags)',
			table: { type: { summary: 'StorylistTeaser' }, defaultValue: { summary: 'required' } },
		},
	},
};

export default meta;
type Story = StoryObj<NavigableCollectionTeaserComponent>;

export const Default: Story = {
	name: 'Por defecto',
	render: (args) => ({ props: args, template: `<cuentoneta-navigable-collection-teaser ${argsToTemplate(args)} />` }),
	args: { collection: storylistTeaserRepresentativeMock },
	parameters: {
		docs: {
			description: {
				story: `<p>Item completo: ícono de colección, nombre, categoría y cantidad de historias. Toda la tarjeta es clickeable y navega a la colección.</p><p><strong>Usos:</strong> «Otras colecciones sugeridas» en el sidebar de la CollectionPage.</p>`,
			},
		},
	},
};

export const SinCategoria: Story = {
	name: 'Sin categoría',
	render: (args) => ({ props: args, template: `<cuentoneta-navigable-collection-teaser ${argsToTemplate(args)} />` }),
	args: { collection: { ...storylistTeaserRepresentativeMock, tags: [] } },
	parameters: {
		docs: {
			description: {
				story: `<p>Colección sin categoría asignada: se omiten el tag y el separador, y queda solo la cantidad de historias.</p>`,
			},
		},
	},
};

export const TituloLargo: Story = {
	name: 'Título largo',
	render: (args) => ({ props: args, template: `<cuentoneta-navigable-collection-teaser ${argsToTemplate(args)} />` }),
	args: {
		collection: {
			...storylistTeaserRepresentativeMock,
			title: 'Book & Morfi: Especial Michis y Perritos en adopción en el refugio',
		},
	},
	decorators: [componentWrapperDecorator((story) => `<div style="width:320px">${story}</div>`)],
	parameters: {
		docs: {
			description: {
				story: `<p>Colección con título extenso en un contenedor acotado de 320px: el nombre se recorta a una línea con puntos suspensivos.</p>`,
			},
		},
	},
};

export const Estados: StoryObj<NavigableCollectionTeaserComponent & { loading: boolean }> = {
	decorators: [moduleMetadata({ imports: [NavigableCollectionTeaserSkeletonComponent] })],
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			<div class="w-[320px]">
				@if (loading) {
					<cuentoneta-navigable-collection-teaser-skeleton />
				} @else {
					<cuentoneta-navigable-collection-teaser [collection]="collection" />
				}
			</div>
		`,
	}),
	args: { loading: true, collection: storylistTeaserRepresentativeMock },
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

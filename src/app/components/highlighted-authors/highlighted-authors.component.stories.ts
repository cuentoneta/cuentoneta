import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';

import { HighlightedAuthorsComponent } from './highlighted-authors.component';
import { HighlightedAuthorsSkeletonComponent } from './highlighted-authors-skeleton.component';
import { highlightedAuthorsMock } from '@mocks/highlighted-authors.mock';

const meta: Meta<HighlightedAuthorsComponent> = {
	component: HighlightedAuthorsComponent,
	title: 'Componentes V3/HighlightedAuthors',
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
				component: `<div><p>La sección <strong>HighlightedAuthors</strong> muestra hasta 6 autores destacados de la home: cabecera con título, subtítulo y botón "Ver todo" (oculto hasta que exista la página de listado), más una grilla responsive de <a href="./?path=/docs/componentes-v3-authorteaserv3--docs" target="_top"><strong>AuthorTeaserV3</strong></a>.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		authors: {
			control: { type: 'object' },
			description: 'Autores destacados a renderizar (máximo editorial 6)',
			table: { type: { summary: 'HighlightedAuthor[]' }, defaultValue: { summary: '[]' } },
		},
	},
};

export default meta;
type Story = StoryObj<HighlightedAuthorsComponent>;

export const Default: Story = {
	name: 'Por defecto',
	args: { authors: highlightedAuthorsMock },
	parameters: {
		docs: {
			description: {
				story: `<p>Sección completa con 6 autores destacados, tags y conteo de historias.</p>`,
			},
		},
	},
};

export const Empty: Story = {
	name: 'Vacío',
	args: { authors: [] },
	parameters: {
		docs: {
			description: {
				story: `<p>Sin autores: se muestra la cabecera; la grilla queda a la espera del defer.</p>`,
			},
		},
	},
};

export const Skeleton: StoryObj = {
	name: 'Esqueleto',
	decorators: [moduleMetadata({ imports: [HighlightedAuthorsSkeletonComponent] })],
	render: () => ({
		template: `
			<section class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				<cuentoneta-highlighted-authors-skeleton />
			</section>
		`,
	}),
	parameters: {
		docs: { description: { story: 'Skeleton de la grilla (6 teasers).' } },
	},
};

export const Estados: StoryObj<HighlightedAuthorsComponent & { loading: boolean }> = {
	decorators: [moduleMetadata({ imports: [HighlightedAuthorsSkeletonComponent] })],
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			@if (loading) {
				<div class="flex flex-col gap-8">
					<div class="flex flex-col gap-1">
						<h2 class="font-inter text-2xl font-bold text-neutral-900">Autores/as destacados/as</h2>
						<p class="font-inter text-sm text-neutral-600">Una selección curada de autores y autoras imprescindibles</p>
					</div>
					<section class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
						<cuentoneta-highlighted-authors-skeleton />
					</section>
				</div>
			} @else {
				<cuentoneta-highlighted-authors [authors]="authors" />
			}
		`,
	}),
	args: { loading: true, authors: highlightedAuthorsMock },
	parameters: {
		docs: {
			description: {
				story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton en el mismo slot.',
			},
		},
	},
};

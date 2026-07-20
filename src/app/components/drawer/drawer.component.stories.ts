import { applicationConfig, moduleMetadata, Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';

import { DrawerComponent, DrawerDirection } from './drawer.component';
import { DrawerHeaderDirective } from './drawer-header.directive';
import { DrawerFooterDirective } from './drawer-footer.directive';
import { CoverImageComponent } from '@components/cover-image/cover-image.component';
import { TagComponent } from '@components/tag/tag.component';
import { PortableTextParserComponent } from '@components/portable-text-parser/portable-text-parser.component';
import { NavigableCollectionTeaserComponent } from '@components/navigable-collection-teaser/navigable-collection-teaser.component';
import { storylistMock, storylistTeaserRepresentativeMock, storylistTeaserSampleMock } from '@mocks/storylist.mock';

type DrawerArgs = DrawerComponent & { direction: DrawerDirection };

const openButton = `<button type="button" (click)="drawer.open()" class="m-8 rounded-full border border-neutral-300 bg-white px-6 py-3 font-inter text-sm font-semibold">Abrir drawer</button>`;

const meta: Meta<DrawerArgs> = {
	component: DrawerComponent,
	title: 'Componentes V3/Drawer',
	decorators: [moduleMetadata({ imports: [DrawerComponent, DrawerHeaderDirective, DrawerFooterDirective] })],
	parameters: {
		layout: 'fullscreen',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El componente <strong>DrawerComponent</strong> es un panel modal lateral del Design System v3 que aparece desde <code>left</code>/<code>right</code>/<code>top</code>/<code>bottom</code> con una transición de entrada/salida. Se apoya en el elemento nativo <code>&lt;dialog&gt;</code> + <code>showModal()</code> (foco atrapado, Escape y backdrop accesibles, sin dependencias).</p><p>El contenido va por <code>&lt;ng-content&gt;</code>; admite encabezado/pie por <code>cuentonetaDrawerHeader</code>/<code>cuentonetaDrawerFooter</code> o un encabezado por defecto vía <code>title</code>/<code>description</code>. Se abre/cierra por referencia de plantilla (<code>open()</code>/<code>close()</code>) y emite <code>opened</code>/<code>closed</code>/<code>afterClosed</code>. Solo un drawer puede estar activo a la vez.</p></div>`,
			},
		},
	},
	argTypes: {
		direction: {
			control: 'inline-radio',
			options: ['left', 'right', 'top', 'bottom'],
			description: 'Lado desde el que aparece el panel',
			table: { type: { summary: 'DrawerDirection' }, defaultValue: { summary: 'right' } },
		},
		title: {
			control: 'text',
			description: 'Título del encabezado por defecto (omitir si se usa el slot `cuentonetaDrawerHeader`)',
			table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
		},
		description: {
			control: 'text',
			description: 'Bajada opcional del encabezado por defecto',
			table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
		},
		ariaLabel: {
			control: 'text',
			description: 'Nombre accesible del panel cuando no hay `title` ni slot de encabezado',
			table: { type: { summary: 'string' }, defaultValue: { summary: '' } },
		},
		closeOnBackdrop: {
			control: 'boolean',
			description: 'Cerrar al hacer click fuera del panel',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
		},
		closeOnEscape: {
			control: 'boolean',
			description: 'Cerrar al presionar Escape',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
		},
	},
};

export default meta;
type Story = StoryObj<DrawerArgs>;

const directionStory = (direction: DrawerDirection, name: string, usos: string): Story => ({
	name,
	render: (args) => ({
		props: args,
		template: `${openButton}<cuentoneta-drawer #drawer [direction]="direction"><p class="font-inter text-sm text-neutral-700">Contenido de ejemplo. Cerrá con la X, con Escape o con click fuera del panel.</p></cuentoneta-drawer>`,
	}),
	args: { direction },
	parameters: {
		docs: {
			description: {
				story: `<p>Panel que entra desde <strong>${name.toLowerCase()}</strong> con su transición.</p><p><strong>Usos:</strong> ${usos}</p>`,
			},
		},
	},
});

export const Derecha = directionStory(
	'right',
	'Derecha',
	'descripción extendida de una colección ("Leer más" en la CollectionPage).',
);
export const Izquierda = directionStory('left', 'Izquierda', 'navegación o filtros laterales.');
export const Arriba = directionStory('top', 'Arriba', 'notificaciones o banners contextuales.');
export const Abajo = directionStory('bottom', 'Abajo', 'acciones tipo sheet en viewports angostos.');

export const ConEncabezadoYPie: Story = {
	name: 'Con encabezado y pie',
	render: (args) => ({
		props: args,
		template: `
			${openButton}
			<cuentoneta-drawer #drawer [direction]="direction">
				<ng-template cuentonetaDrawerHeader>
					<h2 class="font-inter text-xl font-bold text-neutral-900">Encabezado propio</h2>
				</ng-template>
				<p class="font-inter text-sm text-neutral-700">Cuerpo proyectado por ng-content.</p>
				<ng-template cuentonetaDrawerFooter>
					<p class="font-inter text-xs text-neutral-600">Pie propio del drawer.</p>
				</ng-template>
			</cuentoneta-drawer>
		`,
	}),
	args: { direction: 'right' },
	parameters: {
		docs: {
			description: {
				story: `<p>Encabezado y pie proyectados con <code>cuentonetaDrawerHeader</code>/<code>cuentonetaDrawerFooter</code>.</p><p><strong>Usos:</strong> paneles con acciones fijas en el pie o un encabezado estructurado propio.</p>`,
			},
		},
	},
};

export const ComposicionCollectionPage: Story = {
	name: 'Composición CollectionPage',
	decorators: [
		moduleMetadata({
			imports: [CoverImageComponent, TagComponent, PortableTextParserComponent, NavigableCollectionTeaserComponent],
		}),
		applicationConfig({ providers: [provideRouter([])] }),
	],
	render: (args) => ({
		props: {
			...args,
			collection: storylistMock,
			suggested: [storylistTeaserRepresentativeMock, storylistTeaserSampleMock],
		},
		template: `
			${openButton}
			<cuentoneta-drawer #drawer>
				<div class="flex flex-col gap-4">
					@if (collection.imagery.kind === 'representative') {
						<cuentoneta-cover-image [src]="collection.imagery.image" />
					}
					<div class="flex flex-col items-start gap-2">
						<p class="font-inter text-xl font-bold text-neutral-900">{{ collection.title }}</p>
						@if (collection.tags[0]; as tag) {
							<cuentoneta-tag [label]="tag.title" variant="filled" />
						}
					</div>
				</div>
				<cuentoneta-portable-text-parser
					[paragraphs]="collection.description"
					classes="font-inter text-sm font-medium text-neutral-700"
					class="flex flex-col gap-2"
				/>
				<div class="h-px w-full bg-neutral-200" role="separator"></div>
				<div class="flex flex-col gap-4">
					<h2 class="font-inter text-base font-bold text-neutral-900">Otras colecciones sugeridas</h2>
					@for (item of suggested; track item.slug) {
						<cuentoneta-navigable-collection-teaser [collection]="item" />
					}
				</div>
			</cuentoneta-drawer>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>Réplica del contenido real del drawer de la CollectionPage: portada, título, tag, descripción completa, divisor y colecciones sugeridas — todo por <code>ng-content</code> plano.</p><p><strong>Usos:</strong> el "Leer más" de la descripción de una colección.</p>`,
			},
		},
	},
};

export const SinCierrePorOverlay: Story = {
	name: 'Sin cierre por overlay',
	render: (args) => ({
		props: args,
		template: `${openButton}<cuentoneta-drawer #drawer [direction]="direction" [closeOnBackdrop]="false"><p class="font-inter text-sm text-neutral-700">El click en el overlay no cierra; usá la X o Escape.</p></cuentoneta-drawer>`,
	}),
	args: { direction: 'right' },
	parameters: {
		docs: {
			description: {
				story: `<p>Con <code>closeOnBackdrop</code> en <code>false</code>, el click fuera del panel no cierra.</p><p><strong>Usos:</strong> flujos donde el cierre accidental sería costoso (formularios sin guardar).</p>`,
			},
		},
	},
};

export const SinCierrePorEscape: Story = {
	name: 'Sin cierre por Escape',
	render: (args) => ({
		props: args,
		template: `${openButton}<cuentoneta-drawer #drawer [direction]="direction" [closeOnEscape]="false"><p class="font-inter text-sm text-neutral-700">Escape no cierra; usá la X o el overlay.</p></cuentoneta-drawer>`,
	}),
	args: { direction: 'right' },
	parameters: {
		docs: {
			description: {
				story: `<p>Con <code>closeOnEscape</code> en <code>false</code>, la tecla Escape no cierra el drawer.</p><p><strong>Usos:</strong> paneles que requieren una acción explícita para cerrarse.</p>`,
			},
		},
	},
};

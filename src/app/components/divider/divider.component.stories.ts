import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';

import { corpusLiteraryWorkTeasers } from '@mocks/onoff-corpus.storybook';

import { DividerComponent } from './divider.component';

const meta: Meta<DividerComponent> = {
	component: DividerComponent,
	title: 'Componentes V3/Divider',
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
			description: {
				component: `<div><p>La línea divisoria del Design System v3, <strong>DividerComponent</strong>: una línea de 1px en neutral-200 que separa visualmente contenidos, secciones o grupos de elementos sin introducir una interrupción fuerte en la interfaz. El elemento anfitrión <em>es</em> la línea: no proyecta contenido, no expone acciones ni controles interactivos, y se anuncia como separador (<code>role="separator"</code>) con su orientación.</p><ul><li><strong>horizontal</strong> (default): 1px de alto, ocupa el ancho del contenedor.</li><li><strong>vertical</strong>: 1px de ancho, toma el alto disponible del contenedor.</li></ul></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		orientation: {
			description: 'Eje sobre el que se dibuja la línea. La vertical espera un contenedor flex o grid con alto.',
			control: { type: 'inline-radio' },
			options: ['horizontal', 'vertical'],
			table: { type: { summary: `'horizontal' | 'vertical'` }, defaultValue: { summary: 'horizontal' } },
		},
		decorative: {
			description: 'Marca la línea como puramente visual, sin rol de separador ni orientación anunciada.',
			control: { type: 'boolean' },
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
	},
};

export default meta;
type Story = StoryObj<DividerComponent>;

export const Playground: Story = {
	render: (args) => ({
		props: args,
		// La caja flex con alto le da a la variante vertical el eje sobre el que estirarse; sin ella
		// el control de orientación parecería no hacer nada.
		template: `
			<div class="flex h-24 items-stretch">
				<cuentoneta-divider ${argsToTemplate(args)} />
			</div>
		`,
	}),
	args: { orientation: 'horizontal' },
	parameters: {
		docs: {
			description: {
				story: `<p>Alterná el control <code>orientation</code> para ver los dos ejes en el mismo contenedor.</p>`,
			},
		},
	},
};

export const Horizontal: Story = {
	render: () => ({
		props: { works: corpusLiteraryWorkTeasers.slice(0, 3) },
		template: `
			<div class="flex max-w-md flex-col gap-4 font-inter text-sm text-neutral-700">
				@for (work of works; track work.slug; let last = $last) {
					<p>{{ work.title }}</p>
					@if (!last) {
						<cuentoneta-divider />
					}
				}
			</div>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>horizontal</strong> (default): separa elementos organizados verticalmente. Mantiene una altura fija de 1px y ocupa el ancho disponible del contenedor.</p><p><strong>Usos:</strong> Story, Story List, Author Profile y Author List.</p>`,
			},
		},
	},
};

export const Vertical: Story = {
	render: () => ({
		// `items-stretch` es lo que la variante vertical necesita: se estira sobre el alto del
		// contenedor, así que dentro de un contenedor block quedaría con alto cero.
		props: { work: corpusLiteraryWorkTeasers[0] },
		template: `
			<div class="flex items-stretch gap-4 font-inter text-sm text-neutral-700">
				<p>{{ work.totalReadingTime }} min de lectura</p>
				<cuentoneta-divider orientation="vertical" />
				<p>{{ work.tags[0].title }}</p>
			</div>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>Variante <strong>vertical</strong>: separa elementos organizados horizontalmente. Mantiene un ancho fijo de 1px y ocupa la altura disponible del contenedor, por lo que espera un contenedor flex o grid con alto resuelto.</p><p><strong>Usos:</strong> Story List, Author Profile y Author List.</p>`,
			},
		},
	},
};

export const Decorativo: Story = {
	render: () => ({
		props: { works: corpusLiteraryWorkTeasers.slice(0, 3) },
		template: `
			<ul class="flex max-w-md flex-col gap-4 font-inter text-sm text-neutral-700">
				@for (work of works; track work.slug; let last = $last) {
					<li class="flex flex-col gap-4">
						<span>{{ work.title }}</span>
						@if (!last) {
							<cuentoneta-divider [decorative]="true" />
						}
					</li>
				}
			</ul>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>Dentro de una lista, la línea se marca <code>decorative</code>: la propia lista ya delimita sus ítems, así que anunciarla también como separador repite esa información. Visualmente es idéntica; lo que cambia es que deja de exponer rol y orientación.</p><p><strong>Usos:</strong> las sugerencias de lectura al pie de una obra.</p>`,
			},
		},
	},
};

export const Showcase: Story = {
	render: () => ({
		template: `
			<div class="flex max-w-md flex-col gap-6 font-inter text-sm text-neutral-700">
				<div class="flex flex-col gap-4">
					<p>Horizontal</p>
					<cuentoneta-divider />
					<p>Separa elementos apilados</p>
				</div>
				<div class="flex items-stretch gap-4">
					<p>Vertical</p>
					<cuentoneta-divider orientation="vertical" />
					<p>Separa elementos en fila</p>
				</div>
			</div>
		`,
	}),
	parameters: { docs: { description: { story: 'Las dos orientaciones: horizontal y vertical.' } } },
};

import { applicationConfig, argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';

import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import { LiteraryWorkCardTeaserComponent } from './literary-work-card-teaser.component';
import { coauthorTeaserMock, literaryWorkTeaserFixtureMock } from './literary-work-card-teaser.mock';

// Variantes visuales de la fixture local (título/autoría/portada distintos a mano) para dar
// variedad a las stories sin depender de un corpus real de LiteraryWork (no existe todavía).
const palacioTeaser: LiteraryWorkTeaser = literaryWorkTeaserFixtureMock;
const geometriaTeaser: LiteraryWorkTeaser = {
	...literaryWorkTeaserFixtureMock,
	title: 'Geometría',
	coverImage: 'assets/img/mocks/stories/geometria.png',
};
const elOdioTeaser: LiteraryWorkTeaser = {
	...literaryWorkTeaserFixtureMock,
	title: 'El odio',
	coverImage: 'assets/img/mocks/stories/el-odio.png',
	authors: [...literaryWorkTeaserFixtureMock.authors, coauthorTeaserMock],
};

const meta: Meta<LiteraryWorkCardTeaserComponent> = {
	component: LiteraryWorkCardTeaserComponent,
	title: 'Componentes V3/LiteraryWorkCardTeaser',
	tags: ['autodocs'],
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
	],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Utilizado para representar una vista previa de una obra dentro de listados o secciones de exploración. Resume la información principal del contenido, incluyendo autoría (1..N autores), título, texto truncado, categoría, tiempo estimado de lectura e imagen asociada.</p><p>Su objetivo es facilitar una lectura rápida del contenido disponible y ayudar al usuario a decidir si quiere profundizar en la obra. Puede adaptarse a distintas estructuras visuales según el contexto de uso, manteniendo consistencia en la jerarquía de información y en las acciones disponibles.</p><p>Se implementa en tres variantes seleccionables mediante el input <code>variant</code>:</p><ul><li><strong>OnWhite</strong> (<code>on-white</code>): layout horizontal con imagen a la izquierda, para fondos blancos.</li><li><strong>OnGray</strong> (<code>on-gray</code>): igual a OnWhite, para fondos grises.</li><li><strong>Highlighted</strong> (<code>highlighted</code>): tarjeta destacada con borde, fondo e imagen a la derecha.</li></ul><p>Cada variante admite mostrar opcionalmente autoría, descripción, numeración y etiqueta. El extracto se renderiza desde el HTML ya saneado de la primera sección de la obra (<code>teaserSection.bodyHtml</code>), disponible solo en la vista <code>LiteraryWorkTeaser</code>.</p><p>Se compone de <a href="./?path=/docs/componentes-v3-coverimage--docs" target="_top"><strong>CoverImage</strong></a> (portada) e <a href="./?path=/docs/componentes-v3-imageprofile--docs" target="_top"><strong>ImageProfile</strong></a> (avatar de cada autor).</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		variant: {
			control: { type: 'select' },
			options: ['on-white', 'on-gray', 'highlighted'],
			description: 'Variante visual del componente',
			table: {
				type: { summary: "'on-white' | 'on-gray' | 'highlighted'" },
				defaultValue: { summary: 'on-white' },
			},
		},
		order: {
			control: { type: 'number', min: 1, max: 99 },
			description: 'Numeración opcional de la obra',
			table: { type: { summary: 'number' }, defaultValue: { summary: 'undefined' } },
		},
		tagLabel: {
			control: { type: 'text' },
			description: 'Etiqueta opcional que se muestra antes del tiempo de lectura',
			table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
		},
		showAuthor: {
			control: { type: 'boolean' },
			description: 'Mostrar la autoría con avatar y nombre por cada autor',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
		showExcerpt: {
			control: { type: 'boolean' },
			description: 'Mostrar la descripción/extracto de la obra',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
		excerptLines: {
			control: { type: 'range', min: 1, max: 6, step: 1 },
			description: 'Cantidad de líneas a mostrar en la descripción',
			table: { type: { summary: 'number' }, defaultValue: { summary: '2' } },
		},
		navigationParams: {
			control: { type: 'object' },
			description: 'Parámetros de navegación para el contexto de enrutamiento',
			table: {
				type: { summary: '{ navigation: string; navigationSlug: string }' },
				defaultValue: { summary: 'undefined' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<LiteraryWorkCardTeaserComponent>;

export const OnWhite: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-literary-work-card-teaser ${argsToTemplate(args)} />`,
	}),
	args: {
		literaryWork: palacioTeaser,
		variant: 'on-white',
		order: 1,
		tagLabel: 'Cuento',
		showAuthor: true,
		showExcerpt: true,
		excerptLines: 2,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Variante OnWhite: layout horizontal con la imagen a la izquierda, pensada para fondos blancos.</p><p><strong>Comportamiento:</strong></p><ul><li>El título se trunca a un máximo de 2 líneas.</li><li>El extracto se trunca a un máximo de 2 líneas.</li><li>El avatar y el nombre de cada autor son elementos clickeables. En estado hover, el nombre se subraya para reforzar la affordance de enlace y permitir el acceso directo al perfil del autor y debe aplicarse únicamente sobre los elementos vinculados al autor, sin afectar el resto del contenido de la card.</li></ul><p><strong>Usos:</strong> listados y secciones de exploración de obras.</p>`,
			},
		},
	},
};

export const OnGray: Story = {
	render: (args) => ({
		props: args,
		template: `<div class="rounded-lg bg-neutral-100 p-6"><cuentoneta-literary-work-card-teaser ${argsToTemplate(args)} /></div>`,
	}),
	args: {
		literaryWork: geometriaTeaser,
		variant: 'on-gray',
		order: 1,
		tagLabel: 'Cuento',
		showAuthor: true,
		showExcerpt: true,
		excerptLines: 2,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Variante OnGray: idéntica a OnWhite, pensada para fondos grises.</p><p><strong>Comportamiento:</strong></p><ul><li>El título se trunca a un máximo de 2 líneas.</li><li>El extracto se trunca a un máximo de 2 líneas.</li><li>El avatar y el nombre de cada autor son elementos clickeables. En estado hover, el nombre se subraya para reforzar la affordance de enlace y permitir el acceso directo al perfil del autor y debe aplicarse únicamente sobre los elementos vinculados al autor, sin afectar el resto del contenido de la card.</li></ul><p><strong>Usos:</strong> secciones sobre contenedores grises.</p>`,
			},
		},
	},
};

export const Highlighted: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-literary-work-card-teaser ${argsToTemplate(args)} />`,
	}),
	args: {
		literaryWork: elOdioTeaser,
		variant: 'highlighted',
		order: 1,
		tagLabel: 'Cuento',
		showAuthor: true,
		showExcerpt: true,
		excerptLines: 3,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Variante destacada del componente, utilizada para dar mayor relevancia visual a una obra dentro de un listado o sección específica; tarjeta con borde y fondo, con la imagen a la derecha.</p><p><strong>Comportamiento:</strong></p><ul><li>El título se trunca a un máximo de 2 líneas.</li><li>El extracto se trunca a un máximo de 2 líneas.</li><li>El avatar y el nombre de cada autor son elementos clickeables. En estado hover, el nombre se subraya para reforzar la affordance de enlace y permitir el acceso directo al perfil del autor y debe aplicarse únicamente sobre los elementos vinculados al autor, sin afectar el resto del contenido de la card.</li></ul><p><strong>Usos:</strong> obra destacada dentro de un listado.</p>`,
			},
		},
	},
};

// Nota: se usan bindings explícitos (en lugar de argsToTemplate) porque la variante difiere por
// instancia; argsToTemplate genera bindings `[variant]="variant"` que apuntan a un único `props.variant`.
export const AllVariants: Story = {
	render: (args) => ({
		props: {
			...args,
			literaryWorks: [palacioTeaser, geometriaTeaser, elOdioTeaser],
		},
		template: `
			<div class="flex flex-col gap-10">
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">OnWhite</h3>
					<cuentoneta-literary-work-card-teaser
						variant="on-white"
						[literaryWork]="literaryWorks[0]"
						[order]="order"
						[tagLabel]="tagLabel"
						[showAuthor]="showAuthor"
						[showExcerpt]="showExcerpt"
						[excerptLines]="excerptLines"
					/>
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">OnGray</h3>
					<div class="rounded-lg bg-neutral-100 p-6">
						<cuentoneta-literary-work-card-teaser
							variant="on-gray"
							[literaryWork]="literaryWorks[1]"
							[order]="order"
							[tagLabel]="tagLabel"
							[showAuthor]="showAuthor"
							[showExcerpt]="showExcerpt"
							[excerptLines]="excerptLines"
						/>
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-neutral-600">Highlighted</h3>
					<cuentoneta-literary-work-card-teaser
						variant="highlighted"
						[literaryWork]="literaryWorks[2]"
						[order]="order"
						[tagLabel]="tagLabel"
						[showAuthor]="showAuthor"
						[showExcerpt]="showExcerpt"
						[excerptLines]="3"
					/>
				</div>
			</div>
		`,
	}),
	args: {
		order: 1,
		tagLabel: 'Cuento',
		showAuthor: true,
		showExcerpt: true,
		excerptLines: 2,
	},
	parameters: {
		docs: {
			description: {
				story: 'Vista general de las tres variantes del componente con todas las características habilitadas.',
			},
		},
	},
};

// La tarjeta renderiza su propio skeleton cuando no recibe obra.
export const Estados: StoryObj<LiteraryWorkCardTeaserComponent & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			<div class="w-[680px]">
				@if (loading) {
					<cuentoneta-literary-work-card-teaser
						[variant]="variant"
						[order]="order"
						[showAuthor]="showAuthor"
						[showExcerpt]="showExcerpt"
						[excerptLines]="excerptLines"
					/>
				} @else {
					<cuentoneta-literary-work-card-teaser
						[literaryWork]="literaryWork"
						[variant]="variant"
						[order]="order"
						[tagLabel]="tagLabel"
						[showAuthor]="showAuthor"
						[showExcerpt]="showExcerpt"
						[excerptLines]="excerptLines"
					/>
				}
			</div>
		`,
	}),
	args: {
		loading: true,
		literaryWork: palacioTeaser,
		variant: 'on-white',
		order: 1,
		tagLabel: 'Cuento',
		showAuthor: true,
		showExcerpt: true,
		excerptLines: 2,
	},
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

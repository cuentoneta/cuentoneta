import { applicationConfig, argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';

import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import { LiteraryWorkHomeCardTeaserComponent } from './literary-work-home-card-teaser.component';
import { LiteraryWorkHomeCardTeaserSkeletonComponent } from './literary-work-home-card-teaser-skeleton.component';
import { coauthorTeaserMock, literaryWorkTeaserFixtureMock } from './literary-work-home-card-teaser.mock';

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

const meta: Meta<LiteraryWorkHomeCardTeaserComponent> = {
	component: LiteraryWorkHomeCardTeaserComponent,
	title: 'Componentes V3/LiteraryWorkHomeCardTeaser',
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
				component: `<div><p>Utilizado para representar una vista previa de una obra en la Home. Resume la información principal del contenido, incluyendo autoría (1..N autores), título, categoría, tiempo estimado de lectura e imagen asociada.</p><p>Su objetivo es facilitar un vistazo rápido del contenido disponible y ayudar al usuario a decidir si quiere profundizar en la obra. Presenta un layout vertical angosto con la imagen y la numeración apiladas sobre un contenedor gris.</p><ul><li>El título de la obra se trunca siempre a una sola línea.</li><li>El avatar y el nombre de cada autor son elementos clickeables que enlazan a su perfil; en estado hover, el nombre se subraya.</li></ul><p>Se compone de <a href="./?path=/docs/componentes-v3-coverimage--docs" target="_top"><strong>CoverImage</strong></a> (portada) e <a href="./?path=/docs/componentes-v3-imageprofile--docs" target="_top"><strong>ImageProfile</strong></a> (avatar de cada autor); el skeleton es <strong>LiteraryWorkHomeCardTeaserSkeleton</strong>. Comparte modelo de dominio con <a href="./?path=/docs/componentes-v3-literaryworkcardteaser--docs" target="_top"><strong>LiteraryWorkCardTeaser</strong></a>.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		literaryWork: {
			control: { type: 'object' },
			description: 'Obra a previsualizar (con autoría); si no se provee, la tarjeta renderiza su skeleton',
			table: {
				type: { summary: 'LiteraryWorkTeaser | LiteraryWorkNavigationTeaserWithAuthors' },
				defaultValue: { summary: 'undefined' },
			},
		},
		order: {
			control: { type: 'number', min: 1, max: 99 },
			description: 'Numeración opcional de la obra',
			table: { type: { summary: 'number' }, defaultValue: { summary: 'undefined' } },
		},
		priority: {
			control: { type: 'boolean' },
			description: 'Marca el cover como prioritario (above-the-fold) para la carga de imágenes',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
		tagLabel: {
			control: { type: 'text' },
			description: 'Etiqueta opcional que se muestra antes del tiempo de lectura',
			table: { type: { summary: 'string' }, defaultValue: { summary: 'undefined' } },
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
type Story = StoryObj<LiteraryWorkHomeCardTeaserComponent>;

export const Default: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-literary-work-home-card-teaser ${argsToTemplate(args)} />`,
	}),
	args: {
		literaryWork: palacioTeaser,
		order: 1,
		tagLabel: 'Cuento',
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Variante Default: tarjeta de home con el cover y la numeración apilados sobre el contenedor gris, más la autoría y el título.</p><p><strong>Comportamiento:</strong></p><ul><li>El título se trunca a un máximo de 1 línea.</li><li>El avatar y el nombre de cada autor son elementos clickeables. En estado hover, el nombre se subraya para reforzar la affordance de enlace y permitir el acceso directo al perfil del autor y debe aplicarse únicamente sobre los elementos vinculados al autor, sin afectar el resto del contenido de la card.</li></ul><p><strong>Usos:</strong> Home.</p>`,
			},
		},
	},
};

// Nota: se usan bindings explícitos (en lugar de argsToTemplate) porque la obra difiere por
// instancia; argsToTemplate genera un binding `[literaryWork]="literaryWork"` que apunta a un único props.
export const Galeria: Story = {
	render: (args) => ({
		props: {
			...args,
			literaryWorks: [palacioTeaser, geometriaTeaser, elOdioTeaser],
		},
		template: `
			<div class="flex flex-wrap gap-8">
				<cuentoneta-literary-work-home-card-teaser [literaryWork]="literaryWorks[0]" [order]="1" [tagLabel]="tagLabel" />
				<cuentoneta-literary-work-home-card-teaser [literaryWork]="literaryWorks[1]" [order]="2" [tagLabel]="tagLabel" />
				<cuentoneta-literary-work-home-card-teaser [literaryWork]="literaryWorks[2]" [order]="3" [tagLabel]="tagLabel" />
			</div>
		`,
	}),
	args: {
		tagLabel: 'Cuento',
	},
	parameters: {
		docs: {
			description: {
				story: 'Vista general de varias tarjetas de home, incluida una obra con autoría múltiple (1..N).',
			},
		},
	},
};

export const Skeleton: StoryObj = {
	decorators: [moduleMetadata({ imports: [LiteraryWorkHomeCardTeaserSkeletonComponent] })],
	render: () => ({ template: `<cuentoneta-literary-work-home-card-teaser-skeleton />` }),
	parameters: {
		docs: { description: { story: 'Skeleton de carga de la tarjeta.' } },
	},
};

// La tarjeta renderiza su propio skeleton cuando no recibe obra.
export const Estados: StoryObj<LiteraryWorkHomeCardTeaserComponent & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			<div class="w-[331px]">
				<cuentoneta-literary-work-home-card-teaser
					[literaryWork]="loading ? undefined : literaryWork"
					[order]="order"
					[tagLabel]="tagLabel"
				/>
			</div>
		`,
	}),
	args: {
		loading: true,
		literaryWork: palacioTeaser,
		order: 1,
		tagLabel: 'Cuento',
	},
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

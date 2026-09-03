import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';

import { LiteraryWorkHomeCardTeaserComponent } from './literary-work-home-card-teaser.component';
import { LiteraryWorkHomeCardTeaserSkeletonComponent } from './literary-work-home-card-teaser-skeleton.component';
import { onoffLiteraryWorkTeasersWithMediaSourcesMock } from '@mocks/onoff-literary-work-teasers.mock';
import { corpusLiteraryWorkTeasers, literaryWorkSelectArgType } from '@mocks/onoff-corpus.storybook';

const [teaser] = onoffLiteraryWorkTeasersWithMediaSourcesMock;

const meta: Meta<LiteraryWorkHomeCardTeaserComponent> = {
	component: LiteraryWorkHomeCardTeaserComponent,
	title: 'Componentes V3/LiteraryWorkHomeCardTeaser',
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>Utilizado para representar una vista previa de una obra en la Home. Resume la información principal del contenido, incluyendo autor, título, categoría, tiempo estimado de lectura, imagen asociada y accesos a archivos multimediales como video, X o Spotify.</p><p>Su objetivo es facilitar un vistazo rápido del contenido disponible y ayudar al usuario a decidir si quiere profundizar en la obra.</p><p>Derivada de <a href="./?path=/docs/componentes-v3-literaryworkcardteaser--docs" target="_top"><strong>LiteraryWorkCardTeaser</strong></a>, presenta un layout vertical angosto con la imagen, la numeración y los selectores de multimedia apilados sobre un contenedor gris.</p><ul><li>El título de la obra se trunca siempre a una sola línea.</li><li>Los selectores de multimedia usan siempre la variante <code>Filled</code> del MediaTag (recuadros blancos sobre el gris).</li><li>El avatar y el nombre del autor son elementos clickeables que enlazan al perfil del autor; en estado hover, el nombre se subraya.</li></ul><p>Se compone de <a href="./?path=/docs/componentes-v3-coverimage--docs" target="_top"><strong>CoverImage</strong></a> (portada), <a href="./?path=/docs/componentes-v3-imageprofile--docs" target="_top"><strong>ImageProfile</strong></a> (avatar del autor) y <a href="./?path=/docs/componentes-v3-mediaselectors--docs" target="_top"><strong>MediaSelectors</strong></a> (accesos multimedia); el skeleton es <strong>LiteraryWorkHomeCardTeaserSkeleton</strong>.</p></div>`,
			},
		},
		layout: 'padded',
	},
	argTypes: {
		literaryWork: {
			control: { type: 'object' },
			description: 'Obra a previsualizar (con autor); si no se provee, la tarjeta renderiza su skeleton',
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
		showMultimedia: {
			control: { type: 'boolean' },
			description: 'Mostrar los selectores de multimedia asociados a la obra',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
		navigationParams: {
			control: { type: 'object' },
			description: 'Parámetros de navegación para el contexto de enrutamiento',
			table: {
				type: { summary: 'NavigationParams' },
				defaultValue: { summary: 'undefined' },
			},
		},
	},
};

export default meta;
type Story = StoryObj<LiteraryWorkHomeCardTeaserComponent>;

export const Interactiva: StoryObj<LiteraryWorkHomeCardTeaserComponent & { literaryWorkIndex: number }> = {
	argTypes: {
		literaryWorkIndex: {
			...literaryWorkSelectArgType,
			description: 'Obra del corpus de François Onoff; su portada y título cambian de forma conjunta',
		},
	},
	render: (args) => ({
		props: { ...args, literaryWorks: corpusLiteraryWorkTeasers },
		template: `
			<cuentoneta-literary-work-home-card-teaser
				[literaryWork]="literaryWorks[literaryWorkIndex]"
				[order]="order"
				[tagLabel]="tagLabel"
				[showMultimedia]="showMultimedia"
				[navigationParams]="navigationParams"
			/>
		`,
	}),
	args: {
		literaryWorkIndex: 0,
		order: 1,
		tagLabel: 'Cuento',
		showMultimedia: true,
		navigationParams: { navigation: 'author', navigationSlug: 'francois-onoff' },
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Playground interactivo. Elegí la <strong>Obra</strong> del corpus: su portada y título cambian de forma conjunta. El resto de los controles ajusta numeración, etiqueta y multimedia.</p><p><strong>Usos:</strong> Home.</p>`,
			},
		},
	},
};

export const Default: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-literary-work-home-card-teaser ${argsToTemplate(args)} />`,
	}),
	args: {
		literaryWork: teaser,
		order: 1,
		tagLabel: 'Cuento',
		showMultimedia: true,
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Variante Default: tarjeta de home con el cover, la numeración y los selectores de multimedia apilados sobre el contenedor gris, más el autor y el título. Cuando la obra contenga un archivo multimedial para ser reproducido se va a visualizar con un MediaTag, y este deberá utilizarse siempre en su variante <code>Filled</code>.</p><p><strong>Comportamiento:</strong></p><ul><li>El título se trunca a un máximo de 1 línea.</li><li>El avatar y el nombre del autor son elementos clickeables. En estado hover, el nombre se subraya para reforzar la affordance de enlace y permitir el acceso directo al perfil del autor y debe aplicarse únicamente sobre los elementos vinculados al autor, sin afectar el resto del contenido de la card.</li></ul><p><strong>Usos:</strong> Home.</p>`,
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

// La tarjeta renderiza su propio skeleton cuando no recibe story.
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
					[showMultimedia]="showMultimedia"
				/>
			</div>
		`,
	}),
	args: {
		loading: true,
		literaryWork: teaser,
		order: 1,
		tagLabel: 'Cuento',
		showMultimedia: true,
	},
	parameters: {
		docs: { description: { story: 'Activá/desactivá "Cargando" para alternar entre el estado real y el skeleton.' } },
	},
};

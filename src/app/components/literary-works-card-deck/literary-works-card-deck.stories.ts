import { argsToTemplate, Meta, moduleMetadata, StoryObj } from '@storybook/angular-vite';

import { LiteraryWorksCardDeck } from './literary-works-card-deck';
import { SectionHeaderComponent } from '@components/section-header/section-header.component';
import { LiteraryWorkHomeCardTeaserSkeletonComponent } from '@components/literary-work-home-card-teaser/literary-work-home-card-teaser-skeleton.component';
import { onoffLiteraryWorkNavigationTeasersWithAuthorsMock } from '@mocks/onoff-literary-work-teasers.mock';

// Un solo dataset compartido por todas las stories: las mismas obras en cada estado hacen que el switch
// del catálogo compare siempre lo mismo.
const literaryWorks = onoffLiteraryWorkNavigationTeasersWithAuthorsMock.slice(0, 6);

const meta: Meta<LiteraryWorksCardDeck> = {
	component: LiteraryWorksCardDeck,
	title: 'Componentes V3/LiteraryWorksCardDeck',
	decorators: [
		moduleMetadata({
			imports: [SectionHeaderComponent, LiteraryWorkHomeCardTeaserSkeletonComponent],
		}),
	],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El <strong>LiteraryWorksCardDeck</strong> es la grilla de obras destacadas de la página de inicio en el Design System v3: un <a href="./?path=/docs/componentes-v3-sectionheader--docs" target="_top"><strong>SectionHeader</strong></a> parametrizado sobre una grilla responsiva de una columna en mobile y tres desde <code>md</code>, con una vista previa por obra resuelta por <a href="./?path=/docs/componentes-v3-literaryworkhomecardteaser--docs" target="_top"><strong>LiteraryWorkHomeCardTeaser</strong></a>.</p><p>La página monta dos instancias de este mismo componente —"Últimas novedades" y "Obras más leídas"— que solo difieren en su copy: el encabezado llega por input justamente para que no vuelvan a ser dos componentes gemelos. El host se expone como región con el nombre del encabezado, que es lo que permite localizar cada instancia sin depender de su posición. Mientras difiere la carga dibuja los skeletons dentro de su bloque <code>@defer</code>, y sin obras queda solo el encabezado.</p></div>`,
			},
		},
	},
	argTypes: {
		literaryWorks: {
			control: { type: 'object' },
			description: 'Obras a destacar; vacío deja solo el encabezado',
			table: {
				type: { summary: 'readonly LiteraryWorkNavigationTeaserWithAuthors[]' },
				defaultValue: { summary: '[]' },
			},
		},
		heading: {
			control: { type: 'text' },
			description: 'Título de la sección',
			table: { type: { summary: 'string' } },
		},
		subtitle: {
			control: { type: 'text' },
			description: 'Bajada de la sección',
			table: { type: { summary: 'string' }, defaultValue: { summary: "''" } },
		},
		action: {
			control: { type: 'object' },
			description: 'Destino del enlace "Ver todo" y el sufijo que nombra ese destino',
			table: { type: { summary: 'SectionHeaderAction | undefined' }, defaultValue: { summary: 'undefined' } },
		},
	},
};
export default meta;
type Story = StoryObj<LiteraryWorksCardDeck>;

export const Primary: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-literary-works-card-deck ${argsToTemplate(args)} />`,
	}),
	args: {
		literaryWorks,
		heading: 'Últimas novedades',
		subtitle: 'Descubrí las obras que se sumaron recientemente a La Cuentoneta',
		action: { link: ['/', 'literary-work'], accessibleSuffix: 'el catálogo de obras' },
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Seis obras derivadas del canon de Onoff; la grilla arma dos filas de tres desde viewport <code>md</code>. Cada tarjeta enlaza a la ruta de lectura de su obra.</p><p><strong>Usos:</strong> la sección de últimas novedades de la página de inicio.</p>`,
			},
		},
	},
};

export const MasLeidas: Story = {
	name: 'Más leídas',
	render: (args) => ({
		props: args,
		template: `<cuentoneta-literary-works-card-deck ${argsToTemplate(args)} />`,
	}),
	args: {
		literaryWorks,
		heading: 'Obras más leídas',
		subtitle: 'Explorá los textos más populares entre los lectores',
		action: { link: ['/', 'literary-work'], accessibleSuffix: 'el catálogo de obras' },
	},
	parameters: {
		docs: {
			description: {
				story: `<p>El mismo componente con el otro copy de la página de inicio, que es lo que demuestra la unificación: entre esta story y la anterior no cambia una sola línea de plantilla.</p><p><strong>Usos:</strong> la sección de obras más leídas de la página de inicio.</p>`,
			},
		},
	},
};

export const Estados: StoryObj<LiteraryWorksCardDeck & { loading: boolean }> = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		// El mismo tope que el componente: la rama de carga no depende de cuántas obras traiga el control.
		props: { ...args, skeletonCount: 6 },
		template: `
			@if (loading) {
				<div class="mb-8 flex flex-col gap-8">
					<cuentoneta-section-header [heading]="heading" [subtitle]="subtitle" [action]="action" />
					<section class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
						@for (_ of [].constructor(skeletonCount); track $index) {
							<cuentoneta-literary-work-home-card-teaser-skeleton />
						}
					</section>
				</div>
			} @else {
				<cuentoneta-literary-works-card-deck
					[literaryWorks]="literaryWorks"
					[heading]="heading"
					[subtitle]="subtitle"
					[action]="action"
				/>
			}
		`,
	}),
	args: {
		loading: true,
		literaryWorks,
		heading: 'Últimas novedades',
		subtitle: 'Descubrí las obras que se sumaron recientemente a La Cuentoneta',
		action: { link: ['/', 'literary-work'], accessibleSuffix: 'el catálogo de obras' },
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Activá/desactivá "Cargando" para alternar entre el estado real y el estado de carga del deck: el encabezado se sostiene y la grilla dibuja los seis esqueletos que dibuja el componente, sin depender de cuántas obras traiga el control.</p><p><strong>Usos:</strong> verificar que el encabezado no salte entre los dos estados.</p>`,
			},
		},
	},
};

export const Vacia: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-literary-works-card-deck ${argsToTemplate(args)} />`,
	}),
	args: {
		literaryWorks: [],
		heading: 'Últimas novedades',
		subtitle: 'Descubrí las obras que se sumaron recientemente a La Cuentoneta',
		action: { link: ['/', 'literary-work'], accessibleSuffix: 'el catálogo de obras' },
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Sin obras el <code>@defer</code> no dispara: queda el encabezado, sin tarjetas ni esqueletos. Es el valor default del input <code>literaryWorks</code>, y el estado que la página sirve una semana sin contenido nuevo.</p><p><strong>Usos:</strong> revisar qué ve alguien que llega en una semana vacía.</p>`,
			},
		},
	},
};

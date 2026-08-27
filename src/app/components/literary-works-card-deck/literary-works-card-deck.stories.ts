import { argsToTemplate, Meta, StoryObj } from '@storybook/angular-vite';

import { LiteraryWorksCardDeck } from './literary-works-card-deck';
import { onoffLiteraryWorkNavigationTeasersWithAuthorsMock } from '@mocks/onoff-literary-work-teasers.mock';

// Un solo dataset compartido por todas las stories: las mismas obras en cada estado hacen que el switch
// del catálogo compare siempre lo mismo.
const literaryWorks = onoffLiteraryWorkNavigationTeasersWithAuthorsMock.slice(0, 6);

const meta: Meta<LiteraryWorksCardDeck> = {
	component: LiteraryWorksCardDeck,
	title: 'Componentes V3/LiteraryWorksCardDeck',
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El <strong>LiteraryWorksCardDeck</strong> es la grilla de una tirada de obras en el Design System v3: un <a href="./?path=/docs/componentes-v3-sectionheader--docs" target="_top"><strong>SectionHeader</strong></a> opcional sobre una grilla responsiva de una columna en mobile y tres desde <code>md</code>, con una vista previa por obra resuelta por <a href="./?path=/docs/componentes-v3-literaryworkhomecardteaser--docs" target="_top"><strong>LiteraryWorkHomeCardTeaser</strong></a>.</p><p>Todo lo que distingue a una tirada de otra —su título, su bajada y a dónde lleva su acción— entra por input, así que una misma página puede montar varias y cualquier otra puede reusarlo. Con título, el host se expone como región con ese nombre, que es lo que permite localizar cada instancia sin depender de su posición; sin título ni bajada queda la grilla sola y el host no se anuncia como región. El estado de carga entra por input, porque el dueño del recurso es la página: cargando dibuja esqueletos, con obras la grilla, y sin obras el aviso de <a href="./?path=/docs/componentes-v3-emptystate--docs" target="_top"><strong>EmptyState</strong></a>.</p></div>`,
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
			description: 'Título de la sección; vacío deja la grilla sin encabezado',
			table: { type: { summary: 'string' }, defaultValue: { summary: "''" } },
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
		loading: {
			control: { type: 'boolean' },
			description: 'Estado de carga del recurso que alimenta la tirada; lo decide la página',
			table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
		},
		emptyMessage: {
			control: { type: 'text' },
			description: 'Qué decir cuando la tirada viene vacía',
			table: { type: { summary: 'string' }, defaultValue: { summary: "'Todavía no hay obras para mostrar acá.'" } },
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

export const SinEncabezado: Story = {
	name: 'Sin encabezado',
	render: (args) => ({
		props: args,
		template: `<cuentoneta-literary-works-card-deck ${argsToTemplate(args)} />`,
	}),
	args: { literaryWorks },
	parameters: {
		docs: {
			description: {
				story: `<p>Sin título ni bajada queda la grilla sola, y el host deja de anunciarse como región: una región sin nombre estorba más de lo que ayuda. Es la forma que sirve a una página que ya presenta la sección por su cuenta.</p><p><strong>Usos:</strong> montar la tirada dentro de una sección que ya tiene su propio encabezado.</p>`,
			},
		},
	},
};

// El switch mueve el input real del componente, así que alcanza con una sola instancia: no hay markup
// duplicado que pueda divergir de lo que el componente dibuja.
export const Estados: Story = {
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `<cuentoneta-literary-works-card-deck ${argsToTemplate(args)} />`,
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
				story: `<p>Activá/desactivá "Cargando" para alternar entre el estado real y el de carga: el encabezado se sostiene y la grilla dibuja los seis esqueletos del componente, sin depender de cuántas obras traiga el control. Vaciando además la lista de obras aparece el tercer estado, el del aviso de vacío.</p><p><strong>Usos:</strong> verificar que el encabezado no salte entre estados.</p>`,
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
				story: `<p>Sin obras queda el encabezado y, en lugar de la grilla, el aviso de que no hay nada que mostrar: un hueco en blanco se leería como contenido que no terminó de cargar. Es el valor default del input <code>literaryWorks</code>, y el estado que la página sirve una semana sin contenido nuevo.</p><p><strong>Usos:</strong> revisar qué ve alguien que llega en una semana vacía.</p>`,
			},
		},
	},
};

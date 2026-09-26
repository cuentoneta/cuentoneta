import type { Meta, StoryObj } from '@storybook/angular-vite';
import { argsToTemplate } from '@storybook/angular-vite';

import { SectionHeaderComponent } from './section-header.component';

const meta: Meta<SectionHeaderComponent> = {
	component: SectionHeaderComponent,
	title: 'Componentes V3/SectionHeader',
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El <strong>SectionHeader</strong> es el encabezado que abre cada sección de la página de inicio en el Design System v3: título de nivel 2, bajada opcional y una acción opcional hacia el índice completo de la sección, resuelta por <a href="./?path=/docs/componentes-v3-button--docs" target="_top"><strong>Button</strong></a> en su variante <code>outline</code>.</p><p>El texto visible de la acción es siempre "Ver todo" y no se parametriza: el diseño lo repite idéntico en todas las secciones, y abrirlo solo habilitaría que las copias diverjan. Lo que sí recibe de cada consumidor es el nombre accesible, porque cuatro enlaces llamados "Ver todo" no distinguen destinos para quien navega por la lista de enlaces. Omitir el destino deja el encabezado sin enlace alguno.</p></div>`,
			},
		},
	},
	argTypes: {
		heading: {
			control: { type: 'text' },
			description: 'Título de la sección, renderizado como encabezado de nivel 2; vacío lo omite',
			table: { type: { summary: 'string' }, defaultValue: { summary: "''" } },
		},
		subtitle: {
			control: { type: 'text' },
			description: 'Bajada de la sección; vacía omite el renglón',
			table: { type: { summary: 'string' }, defaultValue: { summary: "''" } },
		},
		action: {
			control: { type: 'object' },
			description: 'Destino del enlace "Ver todo" y el sufijo que nombra ese destino; omitirlo quita la acción',
			table: { type: { summary: 'SectionHeaderAction | undefined' }, defaultValue: { summary: 'undefined' } },
		},
	},
};
export default meta;
type Story = StoryObj<SectionHeaderComponent>;

export const Primary: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-section-header ${argsToTemplate(args)} />`,
	}),
	args: {
		heading: 'Últimas novedades',
		subtitle: 'Descubrí las obras que se sumaron recientemente a La Cuentoneta',
		action: { link: ['/', 'literary-work'], accessibleSuffix: 'el catálogo de obras' },
	},
	parameters: {
		docs: {
			description: {
				story: `<p>La forma plena: título, bajada y acción hacia el índice de obras. El botón queda alineado a la derecha y no se encoge, así que la bajada puede crecer sin desplazarlo.</p><p><strong>Usos:</strong> las secciones de novedades, obras más leídas, autores destacados y colecciones de la página de inicio.</p>`,
			},
		},
	},
};

export const SinAccion: Story = {
	name: 'Sin acción',
	render: (args) => ({
		props: args,
		template: `<cuentoneta-section-header ${argsToTemplate(args)} />`,
	}),
	args: {
		heading: 'Sobre La Cuentoneta',
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Sin destino no hay enlace: el encabezado queda con el título solo. Es la forma que usa la sección "Sobre La Cuentoneta", que no tiene índice al que llevar.</p><p><strong>Usos:</strong> secciones que cierran en sí mismas, sin vista ampliada.</p>`,
			},
		},
	},
};

export const SinBajada: Story = {
	render: (args) => ({
		props: args,
		template: `<cuentoneta-section-header ${argsToTemplate(args)} />`,
	}),
	args: {
		heading: 'Colecciones',
		action: { link: ['/', 'collection'], accessibleSuffix: 'el índice de colecciones' },
	},
	parameters: {
		docs: {
			description: {
				story: `<p>Con la bajada vacía el renglón no se reserva, así que el título y el botón quedan centrados entre sí en vez de alinearse contra un espacio en blanco.</p><p><strong>Usos:</strong> secciones cuyo título ya es autoexplicativo.</p>`,
			},
		},
	},
};

export const Showcase: Story = {
	render: () => ({
		props: {
			sections: [
				{
					heading: 'Últimas novedades',
					subtitle: 'Descubrí las obras que se sumaron recientemente a La Cuentoneta',
					action: { link: ['/', 'literary-work'], accessibleSuffix: 'el catálogo de obras' },
				},
				{
					heading: 'Autores/as destacados/as',
					subtitle: 'Una selección curada de autores y autoras imprescindibles',
					action: { link: ['/', 'authors'], accessibleSuffix: 'el índice de autores' },
				},
				{
					heading: 'Obras más leídas',
					subtitle: 'Explorá los textos más populares entre los lectores',
					action: { link: ['/', 'literary-work'], accessibleSuffix: 'el catálogo de obras' },
				},
				{
					heading: 'Colecciones',
					subtitle: 'Obras agrupadas por temas, estilos y universos en común',
					action: { link: ['/', 'collection'], accessibleSuffix: 'el índice de colecciones' },
				},
			],
		},
		template: `
			<div class="flex flex-col gap-8">
				@for (section of sections; track section.heading) {
					<cuentoneta-section-header
						[heading]="section.heading"
						[subtitle]="section.subtitle"
						[action]="section.action"
					/>
				}
			</div>
		`,
	}),
	parameters: {
		docs: {
			description: {
				story: `<p>Los cuatro encabezados de la página de inicio apilados, con sus copys reales. Es donde se ve que la alineación del botón se sostiene con bajadas de largo distinto, y que los cuatro nombres accesibles difieren aunque el texto visible sea el mismo.</p><p><strong>Usos:</strong> revisar la coherencia del conjunto antes de tocar un copy.</p>`,
			},
		},
	},
};

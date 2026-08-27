import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular-vite';
import { provideRouter } from '@angular/router';
import { NEVER, of, throwError, type Observable } from 'rxjs';

import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import {
	onoffLiteraryWorkTeasersMock,
	onoffLiteraryWorkTeasersWithMediaSourcesMock,
} from '@mocks/onoff-literary-work-teasers.mock';

import { provideLiteraryWorkApiMock } from '../../providers/literary-work.mock';
import type { LiteraryWorkApi } from '../../providers/literary-work.provider';
import LiteraryWorksPage from './literary-works.page';

// Ninguna obra del canon declara multimedia, así que el catálogo enriquecido es el único escenario
// donde los selectores de formato de las tarjetas tienen algo que dibujar.
const catalogues = {
	corpus: onoffLiteraryWorkTeasersMock,
	multimedia: onoffLiteraryWorkTeasersWithMediaSourcesMock,
	empty: [] as readonly LiteraryWorkTeaser[],
} as const;

type Scenario = keyof typeof catalogues | 'loading' | 'failure';

class StubScenarioLiteraryWorkApi implements LiteraryWorkApi {
	constructor(private readonly scenario: Scenario) {}

	public getBySlug(): Observable<LiteraryWork> {
		return throwError(() => new Error('El catálogo no consulta por slug'));
	}

	public getTeasers(): Observable<LiteraryWorkTeaser[]> {
		if (this.scenario === 'failure') {
			return throwError(() => new Error('sin catálogo'));
		}
		// `NEVER` deja el recurso pendiente, que es la única forma de sostener el esqueleto a la vista.
		if (this.scenario === 'loading') {
			return NEVER;
		}
		return of([...catalogues[this.scenario]]);
	}
}

type LiteraryWorksPageArgs = { scenario: Scenario };

const meta: Meta<LiteraryWorksPageArgs> = {
	component: LiteraryWorksPage,
	title: 'Páginas/LiteraryWorksPage',
	// Uno por render: la página de autodocs monta todas las entradas a la vez y una instancia común
	// dejaría que el escenario de una resolviera dentro de otra.
	decorators: [
		(story, context) =>
			applicationConfig({
				providers: [
					provideRouter([]),
					provideLiteraryWorkApiMock(new StubScenarioLiteraryWorkApi((context.args as LiteraryWorksPageArgs).scenario)),
				],
			})(story, context),
	],
	parameters: {
		layout: 'fullscreen',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El catálogo de obras, <strong>LiteraryWorksPage</strong>, montado sobre el corpus de Onoff. Como el resto de las entradas bajo <strong>Páginas</strong>, no cataloga un componente sino el ensamblado completo: el encabezado con el conteo y la tabla de obras, con su título enlazado a la lectura, su autoría enlazada al perfil y su tiempo de lectura.</p><p>El único control elige el escenario del catálogo, que es lo único que mueve la página desde afuera: no recibe parámetros de ruta ni tiene estado propio.</p><p>La tabla es la misma que sirve hoy el listado que este catálogo reemplaza: se conserva a propósito, porque el rediseño de esta pantalla todavía no existe. Los títulos enlazan a <a href="./?path=/docs/páginas-readpage--docs" target="_top"><strong>ReadPage</strong></a>. La única pieza del sistema de diseño que monta es <a href="./?path=/docs/componentes-v3-skeleton--docs" target="_top"><strong>Skeleton</strong></a>, en las filas de carga.</p><p>El orden no es el que entrega el backend: se resuelve en la página con colación en español, porque la base compara por punto de código y mandaría al final del catálogo todo título que empiece con acento o eñe.</p><p>El encabezado fijo de la aplicación no se monta en el catálogo, así que el margen superior de la página se ve como espacio en blanco.</p></div>`,
			},
		},
	},
	argTypes: {
		scenario: {
			name: 'Catálogo',
			control: { type: 'inline-radio' },
			options: ['corpus', 'multimedia', 'loading', 'empty', 'failure'],
			table: { type: { summary: "'corpus' | 'multimedia' | 'loading' | 'empty' | 'failure'" } },
		},
	},
};

export default meta;
type Story = StoryObj<LiteraryWorksPageArgs>;

export const Playground: Story = {
	args: { scenario: 'corpus' },
	parameters: {
		docs: {
			description: {
				story: `<p>El catálogo con el control vivo. Cambiá <strong>Catálogo</strong> para recorrer los cuatro estados, y en particular para alternar entre <strong>corpus</strong> y <strong>loading</strong>: las filas de carga ocupan la misma tabla que las resueltas, así que la alineación de las columnas entre las dos se puede evaluar de un vistazo.</p>`,
			},
		},
	},
};

export const CatalogoDelCorpus: Story = {
	args: { scenario: 'corpus' },
	parameters: {
		docs: {
			description: {
				story: `<p>El corpus completo, tal como lo sirve el backend.</p><p><strong>Usos:</strong> mirar la tabla con datos reales y verificar el orden alfabético con plegado de acentos.</p>`,
			},
		},
	},
};

export const CatalogoCargando: Story = {
	args: { scenario: 'loading' },
	parameters: {
		docs: {
			description: {
				story: `<p>El catálogo mientras carga: filas de esqueleto dentro de la misma tabla, con el encabezado de columnas ya servido. Alternar con <strong>corpus</strong> desde el control de <strong>Playground</strong> es lo que permite verificar que las columnas no se corran al resolver.</p><p>En la aplicación servida este estado no llega al HTML: el recurso bloquea el render del servidor. Se ve al navegar dentro de la aplicación.</p>`,
			},
		},
	},
};

export const CatalogoVacio: Story = {
	args: { scenario: 'empty' },
	parameters: {
		docs: {
			description: {
				story: `<p>Un catálogo que resolvió sin obras. Lo dice con todas las letras en vez de dejar la tabla vacía: un catálogo vacío y un catálogo cargando significan cosas opuestas y no pueden verse igual.</p>`,
			},
		},
	},
};

export const CatalogoQueFalla: Story = {
	args: { scenario: 'failure' },
	parameters: {
		docs: {
			description: {
				story: `<p>El catálogo no se pudo cargar. Se distingue del catálogo vacío a propósito: sin el mensaje, la página afirmaría que no hay obras cuando lo que hubo fue un fallo.</p><p>En la aplicación servida, además, la respuesta sale con código 503 para que el borde no cachee el fallo como si fuera la página.</p>`,
			},
		},
	},
};

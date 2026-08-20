import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular-vite';
import { provideRouter } from '@angular/router';
import { NEVER, of, throwError, type Observable } from 'rxjs';

import { createCollectionTeaser, type Collection, type CollectionTeaser } from '@models/collection.model';
import { onoffCollectionTeasersMock } from '@mocks/onoff-collections.mock';

import { provideCollectionApiMock } from '../../providers/collection.mock';
import type { CollectionApi } from '../../providers/collection.provider';
import CollectionsPage from './collections.page';

// El corpus tiene dos colecciones, que llenan una sola fila de la grilla. Para poder mirar el catálogo
// como catálogo —varias filas y el orden con acentos— se derivan más entradas del canon, en vez de
// escribir teasers a mano.
const [canonical] = onoffCollectionTeasersMock;
const derived = (title: string, slug: string): CollectionTeaser =>
	createCollectionTeaser({
		_id: `${canonical._id}-${slug}`,
		slug,
		title,
		description: canonical.description,
		imagery: canonical.imagery,
		tags: canonical.tags,
		config: canonical.config,
		mediaSources: canonical.mediaSources,
		count: canonical.count,
	});

const catalogues = {
	corpus: onoffCollectionTeasersMock,
	extended: [
		...onoffCollectionTeasersMock,
		derived('Ámbar y ceniza', 'ambar-y-ceniza'),
		derived('Bitácora de la espera', 'bitacora-de-la-espera'),
		derived('Ñandubay', 'nandubay'),
		derived('Zoológico de bolsillo', 'zoologico-de-bolsillo'),
	],
	empty: [] as readonly CollectionTeaser[],
} as const;

type Scenario = keyof typeof catalogues | 'loading' | 'failure';

class StubScenarioCollectionApi implements CollectionApi {
	constructor(private readonly scenario: Scenario) {}

	public getBySlug(): Observable<Collection> {
		return throwError(() => new Error('El catálogo no consulta por slug'));
	}

	public getAll(): Observable<CollectionTeaser[]> {
		if (this.scenario === 'failure') {
			return throwError(() => new Error('sin catálogo'));
		}
		// Nunca emite: deja el recurso pendiente, que es la única forma de sostener el esqueleto a la vista.
		if (this.scenario === 'loading') {
			return NEVER;
		}
		return of([...catalogues[this.scenario]]);
	}
}

type CollectionsPageArgs = { scenario: Scenario };

const meta: Meta<CollectionsPageArgs> = {
	component: CollectionsPage,
	title: 'Páginas/CollectionsPage',
	// El doble se construye por render y no se comparte: la página de autodocs monta las cinco entradas a
	// la vez, y una instancia común dejaría que el escenario de una resolviera dentro de otra.
	decorators: [
		(story, context) =>
			applicationConfig({
				providers: [
					provideRouter([]),
					provideCollectionApiMock(new StubScenarioCollectionApi((context.args as CollectionsPageArgs).scenario)),
				],
			})(story, context),
	],
	parameters: {
		layout: 'fullscreen',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El catálogo de colecciones, <strong>CollectionsPage</strong>, montado sobre el corpus de Onoff. Como el resto de las entradas bajo <strong>Páginas</strong>, no cataloga un componente sino el ensamblado completo: el encabezado, la bajada y la grilla de tarjetas que llevan al detalle.</p><p>El único control elige el escenario del catálogo, que es lo único que mueve la página: no recibe parámetros de ruta.</p><p>Se compone de <a href="./?path=/docs/componentes-v3-collectionteasercard--docs" target="_top"><strong>CollectionTeaserCard</strong></a>, la misma tarjeta que enlaza a <a href="./?path=/docs/páginas-collectionpage--docs" target="_top"><strong>CollectionPage</strong></a>, y de su esqueleto.</p><p>El orden no es el que entrega el backend: se resuelve en la página con colación en español, porque la base compara por punto de código y mandaría al final del catálogo todo título que empiece con acento o eñe. El escenario <strong>extended</strong> es el que lo hace visible.</p><p>El encabezado fijo de la aplicación no se monta en el catálogo, así que el margen superior de la página se ve como espacio en blanco.</p></div>`,
			},
		},
	},
	argTypes: {
		scenario: {
			name: 'Catálogo',
			control: { type: 'inline-radio' },
			options: ['corpus', 'extended', 'loading', 'empty', 'failure'],
			table: { type: { summary: "'corpus' | 'extended' | 'loading' | 'empty' | 'failure'" } },
		},
	},
};

export default meta;
type Story = StoryObj<CollectionsPageArgs>;

export const Playground: Story = {
	args: { scenario: 'extended' },
	parameters: {
		docs: {
			description: {
				story: `<p>El catálogo con el control vivo. Cambiá <strong>Catálogo</strong> para recorrer los cinco estados, y en particular para alternar entre <strong>extended</strong> y <strong>loading</strong>: la grilla real y la de esqueletos ocupan el mismo lugar, así que la alineación entre las dos se puede evaluar de un vistazo.</p>`,
			},
		},
	},
};

export const CatalogoDelCorpus: Story = {
	args: { scenario: 'corpus' },
	parameters: {
		docs: {
			description: {
				story: `<p>Las dos colecciones del corpus, tal como las sirve el backend. Llenan una sola fila de la grilla.</p><p><strong>Usos:</strong> mirar la tarjeta con datos reales, sin entradas derivadas.</p>`,
			},
		},
	},
};

export const CatalogoExtendido: Story = {
	args: { scenario: 'extended' },
	parameters: {
		docs: {
			description: {
				story: `<p>El corpus más cuatro entradas derivadas, para ver la grilla con varias filas. Es la única entrada donde el orden se puede evaluar: <strong>Ámbar y ceniza</strong> y <strong>Ñandubay</strong> aparecen donde corresponde alfabéticamente y no al final, que es donde los pondría una comparación por punto de código.</p>`,
			},
		},
	},
};

export const CatalogoCargando: Story = {
	args: { scenario: 'loading' },
	parameters: {
		docs: {
			description: {
				story: `<p>El catálogo mientras carga: la grilla de esqueletos, en el mismo lugar y con la misma geometría que la grilla real. Alternar con <strong>extended</strong> desde el control de <strong>Playground</strong> es lo que permite verificar que una no salte respecto de la otra.</p><p>En la aplicación servida este estado no llega al HTML: el recurso bloquea el render del servidor. Se ve al navegar dentro de la aplicación.</p>`,
			},
		},
	},
};

export const CatalogoVacio: Story = {
	args: { scenario: 'empty' },
	parameters: {
		docs: {
			description: {
				story: `<p>Un catálogo que resolvió sin colecciones. Lo dice con todas las letras en vez de quedarse con los esqueletos puestos: un catálogo vacío y un catálogo cargando significan cosas opuestas y no pueden verse igual.</p>`,
			},
		},
	},
};

export const CatalogoQueFalla: Story = {
	args: { scenario: 'failure' },
	parameters: {
		docs: {
			description: {
				story: `<p>El catálogo no se pudo cargar. Se distingue del catálogo vacío a propósito: sin el mensaje, la página afirmaría que no hay colecciones cuando lo que hubo fue un fallo.</p><p>En la aplicación servida, además, la respuesta sale con código 503 para que el borde no cachee el fallo como si fuera la página.</p>`,
			},
		},
	},
};

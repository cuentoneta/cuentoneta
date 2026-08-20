import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular-vite';
import { provideRouter } from '@angular/router';
import { of, throwError, type Observable } from 'rxjs';

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
	extendido: [
		...onoffCollectionTeasersMock,
		derived('Ámbar y ceniza', 'ambar-y-ceniza'),
		derived('Bitácora de la espera', 'bitacora-de-la-espera'),
		derived('Ñandubay', 'nandubay'),
		derived('Zoológico de bolsillo', 'zoologico-de-bolsillo'),
	],
	vacio: [] as readonly CollectionTeaser[],
	falla: [] as readonly CollectionTeaser[],
} as const;

type Escenario = keyof typeof catalogues;

// El escenario no viaja por un input —la página no recibe ninguno—, así que el doble se deja
// gobernar desde afuera y el decorador lo apunta antes de cada render.
class ControllableCollectionApi implements CollectionApi {
	public escenario: Escenario = 'corpus';

	public getBySlug(): Observable<Collection> {
		return throwError(() => new Error('El catálogo no consulta por slug'));
	}

	public getAll(): Observable<CollectionTeaser[]> {
		if (this.escenario === 'falla') {
			return throwError(() => new Error('sin catálogo'));
		}
		return of([...catalogues[this.escenario]]);
	}
}

const collectionApi = new ControllableCollectionApi();

type CollectionsPageArgs = { escenario: Escenario };

const meta: Meta<CollectionsPageArgs> = {
	component: CollectionsPage,
	title: 'Páginas/CollectionsPage',
	decorators: [
		(story, context) => {
			collectionApi.escenario = (context.args as CollectionsPageArgs).escenario;
			return story();
		},
		applicationConfig({ providers: [provideRouter([]), provideCollectionApiMock(collectionApi)] }),
	],
	parameters: {
		layout: 'fullscreen',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>El catálogo de colecciones, <strong>CollectionsPage</strong>, montado sobre el corpus de Onoff. Como el resto de las entradas bajo <strong>Páginas</strong>, no cataloga un componente sino el ensamblado completo: el encabezado, la bajada y la grilla de tarjetas que llevan al detalle.</p><p>El único control elige el escenario del catálogo, que es lo único que mueve la página: no recibe parámetros de ruta.</p><p>Se compone de <a href="./?path=/docs/componentes-v3-collectionteasercard--docs" target="_top"><strong>CollectionTeaserCard</strong></a>, la misma tarjeta que enlaza a <a href="./?path=/docs/páginas-collectionpage--docs" target="_top"><strong>CollectionPage</strong></a>.</p><p>El orden no es el que entrega el backend: se resuelve en la página con colación en español, porque la base compara por punto de código y mandaría al final del catálogo todo título que empiece con acento o eñe. El escenario <strong>extendido</strong> es el que lo hace visible.</p><p>El encabezado fijo de la aplicación no se monta en el catálogo, así que el margen superior de la página se ve como espacio en blanco.</p></div>`,
			},
		},
	},
	argTypes: {
		escenario: {
			name: 'Catálogo',
			control: { type: 'inline-radio' },
			options: ['corpus', 'extendido', 'vacio', 'falla'],
			table: { type: { summary: "'corpus' | 'extendido' | 'vacio' | 'falla'" } },
		},
	},
};

export default meta;
type Story = StoryObj<CollectionsPageArgs>;

export const Playground: Story = {
	args: { escenario: 'extendido' },
	parameters: {
		docs: {
			description: {
				story: `<p>El catálogo con el control vivo. Cambiá <strong>Catálogo</strong> para recorrer los cuatro estados.</p>`,
			},
		},
	},
};

export const CatalogoDelCorpus: Story = {
	args: { escenario: 'corpus' },
	parameters: {
		docs: {
			description: {
				story: `<p>Las dos colecciones del corpus, tal como las sirve el backend. Llenan una sola fila de la grilla.</p><p><strong>Usos:</strong> mirar la tarjeta con datos reales, sin entradas derivadas.</p>`,
			},
		},
	},
};

export const CatalogoExtendido: Story = {
	args: { escenario: 'extendido' },
	parameters: {
		docs: {
			description: {
				story: `<p>El corpus más cuatro entradas derivadas, para ver la grilla con varias filas. Es la única entrada donde el orden se puede evaluar: <strong>Ámbar y ceniza</strong> y <strong>Ñandubay</strong> aparecen donde corresponde alfabéticamente y no al final, que es donde los pondría una comparación por punto de código.</p>`,
			},
		},
	},
};

export const CatalogoVacio: Story = {
	args: { escenario: 'vacio' },
	parameters: {
		docs: {
			description: {
				story: `<p>Un catálogo sin colecciones. La página conserva su encabezado y su bajada: el documento no queda vacío aunque no haya nada que listar.</p>`,
			},
		},
	},
};

export const CatalogoQueFalla: Story = {
	args: { escenario: 'falla' },
	parameters: {
		docs: {
			description: {
				story: `<p>El catálogo no se pudo cargar. Se distingue del catálogo vacío a propósito: sin el mensaje, la página afirmaría que no hay colecciones cuando lo que hubo fue un fallo.</p><p>En la aplicación servida, además, la respuesta sale con código 503 para que el borde no cachee el fallo como si fuera la página.</p>`,
			},
		},
	},
};

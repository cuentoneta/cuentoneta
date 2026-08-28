import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular-vite';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NEVER, of, throwError, type Observable } from 'rxjs';

import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import {
	onoffLiteraryWorksMock,
	onoffLiteraryWorksWithMultipleMediaSources,
	onoffLiteraryWorksWithoutMediaSources,
	onoffLiteraryWorksWithSingleMediaSource,
} from '@mocks/onoff-literary-works.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';

import { provideLiteraryWorkApiMock } from '../../providers/literary-work.mock';
import { provideCollectionApiMock, StubCollectionApi } from '../../providers/collection.mock';
import type { LiteraryWorkApi, LiteraryWorkTeaserFilter } from '../../providers/literary-work.provider';
import LiteraryWorkPage from './literary-work.page';

// Los dos estados que no son una obra entran al control como una opción más, así que se alternan con
// las obras en el mismo slot. Ninguno es un slug del corpus a propósito: si lo fuera, curar esa obra
// lo sacaría del escenario sin que nadie lo note.
const pendingSlug = '__pendiente__';
const missingSlug = '__inexistente__';

// Resuelve por slug contra el corpus, en vez de devolver siempre la misma obra: así el control de obra
// mueve la página entera, y un slug que no existe cae en el estado de obra inexistente, que también es
// parte de lo que hay que poder mirar.
class CorpusLiteraryWorkApi implements LiteraryWorkApi {
	public getBySlug(slug: string): Observable<LiteraryWork> {
		if (slug === pendingSlug) {
			return NEVER;
		}
		const literaryWork = onoffLiteraryWorksMock.find((candidate) => candidate.slug === slug);
		return literaryWork
			? of(literaryWork)
			: throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }));
	}

	public getTeasers(filter: LiteraryWorkTeaserFilter = {}): Observable<LiteraryWorkTeaser[]> {
		return of(
			filter.author
				? onoffLiteraryWorkTeasersMock.filter(({ authors }) => authors.some(({ slug }) => slug === filter.author))
				: [...onoffLiteraryWorkTeasersMock],
		);
	}
}

const corpusSlugLabels = Object.fromEntries([
	...onoffLiteraryWorksMock.map((literaryWork) => [literaryWork.slug, literaryWork.title]),
	[pendingSlug, '— Cargando —'],
	[missingSlug, '— Obra inexistente —'],
]);

// Los destinos de navegación que el corpus puede sostener: el autor de las obras y las dos colecciones.
const authorSlugs = [...new Set(onoffLiteraryWorksMock.flatMap((work) => work.authors.map(({ slug }) => slug)))];
const collectionSlugs = onoffCollectionsMock.map(({ slug }) => slug);

const navigationSlugLabels = Object.fromEntries([
	...onoffLiteraryWorksMock.flatMap((work) => work.authors.map(({ slug, name }) => [slug, `Autor — ${name}`])),
	...onoffCollectionsMock.map(({ slug, title }) => [slug, `Colección — ${title}`]),
]);

type ReadPageArgs = { slug: string; navigation: string; navigationSlug: string };

const meta: Meta<ReadPageArgs> = {
	component: LiteraryWorkPage,
	title: 'Páginas/LiteraryWorkPage',
	decorators: [
		applicationConfig({
			providers: [
				provideRouter([]),
				provideLiteraryWorkApiMock(new CorpusLiteraryWorkApi()),
				provideCollectionApiMock(new StubCollectionApi(onoffCollectionsMock)),
			],
		}),
	],
	parameters: {
		layout: 'fullscreen',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>La página de lectura, <strong>LiteraryWorkPage</strong>, montada sobre el corpus de Onoff. Como el resto de las entradas bajo <strong>Páginas</strong>, no cataloga un componente sino el ensamblado completo, que es lo que permite mirar cómo conviven el encabezado, la barra de lectura, el bloque de formatos, el cuerpo y las sugerencias.</p><p>Los tres controles reproducen lo que la ruta le entrega a la página:</p><ul><li><code>slug</code> — qué obra del corpus se lee. Un slug que no existe cae en el estado de obra inexistente, y la entrada <code>— Cargando —</code> deja la página en su esqueleto.</li><li><code>navigation</code> y <code>navigationSlug</code> — el contexto con el que se llegó, que decide qué <a href="./?path=/docs/componentes-v3-readingsuggestionslist--docs" target="_top"><strong>sugerencias de lectura</strong></a> se ofrecen al pie: las del autor o las de una colección.</li></ul><p>Los dos ejes que el diseño define se recorren desde acá: el <strong>tipo de multimedia</strong>, según cuántos recursos declare la obra —lo resuelve <a href="./?path=/docs/componentes-v3-mediawidgetselector--docs" target="_top"><strong>MediaWidgetSelector</strong></a>—, y la <strong>forma de las sugerencias</strong>, según el contexto de navegación.</p><p>Las sugerencias viven en un bloque diferido por viewport, así que aparecen al bajar hasta el pie. El bloque de formatos también es diferido, pero dispara al quedar el hilo libre, así que en la práctica su esqueleto no llega a verse acá; está catalogado en las entradas de <strong>MediaWidgetSelector</strong>.</p><p>Los destinos de los medios del corpus son ficticios, así que los reproductores no cargan contenido real: lo que se evalúa en estas entradas es la disposición.</p></div>`,
			},
		},
	},
	argTypes: {
		slug: {
			name: 'Obra',
			control: { type: 'select', labels: corpusSlugLabels },
			options: [...onoffLiteraryWorksMock.map(({ slug }) => slug), pendingSlug, missingSlug],
			table: { type: { summary: 'string' } },
		},
		navigation: {
			name: 'Contexto',
			control: { type: 'inline-radio' },
			options: ['author', 'collection'],
			table: { type: { summary: "'author' | 'collection'" }, defaultValue: { summary: 'author' } },
		},
		navigationSlug: {
			name: 'Destino del contexto',
			control: { type: 'select', labels: navigationSlugLabels },
			options: [...authorSlugs, ...collectionSlugs],
			table: { type: { summary: 'string' } },
		},
	},
};

export default meta;
type Story = StoryObj<ReadPageArgs>;

const [firstWork] = onoffLiteraryWorksMock;
const [firstAuthorSlug] = authorSlugs;
const [firstCollectionSlug, secondCollectionSlug] = collectionSlugs;

// El umbral que separa a los tres selectores es el mismo que decide la botonera: hay entre qué elegir,
// hay un solo recurso, o no hay ninguno.
const [multipleSourcesWork] = onoffLiteraryWorksWithMultipleMediaSources;
const [singleSourceWork] = onoffLiteraryWorksWithSingleMediaSource;
const [workWithoutSources] = onoffLiteraryWorksWithoutMediaSources;

export const Playground: Story = {
	// Abre en una obra con formatos: es la única forma de que la entrada principal muestre el bloque.
	args: { slug: multipleSourcesWork.slug, navigation: 'author', navigationSlug: firstAuthorSlug },
	parameters: {
		docs: {
			description: {
				story: `<p>La página completa con los tres controles vivos. Cambiá <strong>Obra</strong> para recorrer el corpus —y con ella, cuántos formatos se ofrecen—, y <strong>Contexto</strong> con su destino para ver cómo cambian las sugerencias del pie.</p>`,
			},
		},
	},
};

export const SugerenciasDelAutor: Story = {
	args: { slug: firstWork.slug, navigation: 'author', navigationSlug: firstAuthorSlug },
	parameters: {
		docs: {
			description: {
				story: `<p>Se llegó desde el listado de un autor: al pie se ofrecen otras obras suyas.</p><p><strong>Usos:</strong> la entrada a una obra desde la página de autor o desde la home.</p>`,
			},
		},
	},
};

export const SugerenciasDeLaColeccion: Story = {
	args: { slug: firstWork.slug, navigation: 'collection', navigationSlug: firstCollectionSlug },
	parameters: {
		docs: {
			description: {
				story: `<p>Se llegó desde una colección: al pie se ofrecen otras obras de esa colección, y el encabezado la nombra. Cambiá <strong>Destino del contexto</strong> a la otra colección para ver cómo acompaña.</p><p><strong>Usos:</strong> la entrada a una obra desde la página de colección.</p>`,
			},
		},
	},
};

export const SugerenciasDeLaOtraColeccion: Story = {
	args: { slug: firstWork.slug, navigation: 'collection', navigationSlug: secondCollectionSlug },
	parameters: {
		docs: {
			description: {
				story: `<p>La segunda colección del corpus, para contrastar contra la anterior que el encabezado y las sugerencias efectivamente siguen al destino.</p>`,
			},
		},
	},
};

export const SinContextoDeNavegacion: Story = {
	args: { slug: firstWork.slug, navigation: 'author', navigationSlug: '' },
	parameters: {
		docs: {
			description: {
				story: `<p>Una obra abierta por URL directa, sin contexto: la página cae en las sugerencias del primer autor de la propia obra, de modo que igual ofrezca a dónde seguir.</p>`,
			},
		},
	},
};

export const ObraInexistente: Story = {
	args: { slug: missingSlug, navigation: 'author', navigationSlug: firstAuthorSlug },
	parameters: {
		docs: {
			description: {
				story: `<p>El estado de obra inexistente, con su salida de vuelta al inicio.</p>`,
			},
		},
	},
};

export const ConVariosFormatos: Story = {
	args: { slug: multipleSourcesWork.slug, navigation: 'author', navigationSlug: firstAuthorSlug },
	parameters: {
		docs: {
			description: {
				story: `<p>Una obra que se ofrece en varios formatos. Lo que se mira acá es el <strong>ensamblado</strong>, no el widget: dónde queda el bloque de formatos entre la barra de lectura y el cuerpo, y cómo cada reproductor se comporta dentro de la columna de lectura, que es más angosta que el ancho del canvas.</p><p>La botonera del propio <a href="./?path=/docs/componentes-v3-mediawidgetselector--docs" target="_top"><strong>MediaWidgetSelector</strong></a> recorre los recursos que la obra declara —uno por botón, aunque dos compartan formato— sin salir de la página: es la misma interacción que hace un lector.</p><p><strong>Usos:</strong> la obra mejor acompañada del catálogo, que es donde el bloque de formatos compite por espacio con el resto de la página.</p>`,
			},
		},
	},
};

export const ConUnSoloFormato: Story = {
	args: { slug: singleSourceWork.slug, navigation: 'author', navigationSlug: firstAuthorSlug },
	parameters: {
		docs: {
			description: {
				story: `<p>La obra ofrecida en un único formato, vista dentro de la página. Es el umbral que el bloque decide por su cuenta: sin nada entre qué elegir, la botonera desaparece y el widget se monta directo.</p><p><strong>Usos:</strong> comparar contra <strong>ConVariosFormatos</strong> cuánto alto se lleva la botonera cuando sí está.</p>`,
			},
		},
	},
};

export const SinFormatos: Story = {
	args: { slug: workWithoutSources.slug, navigation: 'author', navigationSlug: firstAuthorSlug },
	parameters: {
		docs: {
			description: {
				story: `<p>El caso de la mayoría del corpus: la obra no declara formatos y el bloque no se monta en absoluto, así que el cuerpo sigue directo desde la barra de lectura.</p><p><strong>Usos:</strong> el contracaso para evaluar el espaciado de la página sin el bloque, que es como se ve casi siempre.</p>`,
			},
		},
	},
};

export const Cargando: Story = {
	args: { slug: pendingSlug, navigation: 'author', navigationSlug: firstAuthorSlug },
	parameters: {
		docs: {
			description: {
				story: `<p>La página mientras resuelve la obra: el esqueleto que su propia plantilla dibuja. Cambiá <strong>Obra</strong> a cualquier entrada del corpus para alternar contra la página real en el mismo lugar — es lo que permite evaluar si el esqueleto y el contenido tienen el mismo alto, o si al resolver la página salta.</p><p>En la aplicación servida este estado no llega al HTML: el recurso bloquea el render del servidor. Se ve al navegar dentro de la aplicación.</p><p><strong>Usos:</strong> comparar el alto del esqueleto contra el de la página resuelta, que es lo que decide si al cargar la página salta.</p>`,
			},
		},
	},
};

import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular-vite';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError, type Observable } from 'rxjs';

import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';

import { provideLiteraryWorkApiMock } from '../../providers/literary-work.mock';
import { provideCollectionApiMock, StubCollectionApi } from '../../providers/collection.mock';
import type { LiteraryWorkApi } from '../../providers/literary-work.provider';
import ReadPage from './read.page';

// Resuelve por slug contra el corpus, en vez de devolver siempre la misma obra: así el control de obra
// mueve la página entera, y un slug que no existe cae en el estado de obra inexistente, que también es
// parte de lo que hay que poder mirar.
class CorpusLiteraryWorkApi implements LiteraryWorkApi {
	public getBySlug(slug: string): Observable<LiteraryWork> {
		const literaryWork = onoffLiteraryWorksMock.find((candidate) => candidate.slug === slug);
		return literaryWork
			? of(literaryWork)
			: throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }));
	}

	public getByAuthorSlug(slug: string): Observable<LiteraryWorkTeaser[]> {
		return of(onoffLiteraryWorkTeasersMock.filter(({ authors }) => authors.some((author) => author.slug === slug)));
	}
}

const corpusSlugLabels = Object.fromEntries(
	onoffLiteraryWorksMock.map((literaryWork) => [literaryWork.slug, literaryWork.title]),
);

// Los destinos de navegación que el corpus puede sostener: el autor de las obras y las dos colecciones.
const authorSlugs = [...new Set(onoffLiteraryWorksMock.flatMap((work) => work.authors.map(({ slug }) => slug)))];
const collectionSlugs = onoffCollectionsMock.map(({ slug }) => slug);

const navigationSlugLabels = Object.fromEntries([
	...onoffLiteraryWorksMock.flatMap((work) => work.authors.map(({ slug, name }) => [slug, `Autor — ${name}`])),
	...onoffCollectionsMock.map(({ slug, title }) => [slug, `Colección — ${title}`]),
]);

type ReadPageArgs = { slug: string; navigation: string; navigationSlug: string };

const meta: Meta<ReadPageArgs> = {
	component: ReadPage,
	title: 'Páginas/ReadPage',
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
				component: `<div><p>La página de lectura, <strong>ReadPage</strong>, montada sobre el corpus de Onoff. Es la única entrada del catálogo bajo <strong>Páginas</strong>: no cataloga un componente sino el ensamblado completo, que es lo que permite mirar cómo conviven el encabezado, la barra de lectura, el bloque de formatos, el cuerpo y las sugerencias.</p><p>Los tres controles reproducen lo que la ruta le entrega a la página:</p><ul><li><code>slug</code> — qué obra del corpus se lee. Un slug que no existe cae en el estado de obra inexistente.</li><li><code>navigation</code> y <code>navigationSlug</code> — el contexto con el que se llegó, que decide qué <a href="./?path=/docs/componentes-v3-readingsuggestionslist--docs" target="_top"><strong>sugerencias de lectura</strong></a> se ofrecen al pie: las del autor o las de una colección.</li></ul><p>Las sugerencias viven en un bloque diferido por viewport, así que aparecen al bajar hasta el pie.</p></div>`,
			},
		},
	},
	argTypes: {
		slug: {
			name: 'Obra',
			control: { type: 'select', labels: corpusSlugLabels },
			options: onoffLiteraryWorksMock.map(({ slug }) => slug),
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

export const Playground: Story = {
	args: { slug: firstWork.slug, navigation: 'author', navigationSlug: firstAuthorSlug },
	parameters: {
		docs: {
			description: {
				story: `<p>La página completa con los tres controles vivos. Cambiá <strong>Obra</strong> para recorrer el corpus, y <strong>Contexto</strong> con su destino para ver cómo cambian las sugerencias del pie.</p>`,
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
	args: { slug: 'una-obra-que-no-existe', navigation: 'author', navigationSlug: firstAuthorSlug },
	parameters: {
		docs: {
			description: {
				story: `<p>El estado de obra inexistente, con su salida de vuelta al inicio.</p>`,
			},
		},
	},
};

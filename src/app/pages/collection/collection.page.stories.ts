import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular-vite';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError, type Observable } from 'rxjs';

import { createCollection, type Collection, type CollectionTeaser } from '@models/collection.model';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import { onoffCollectionsMock, onoffCollectionTeasersMock } from '@mocks/onoff-collections.mock';

import { provideCollectionApiMock } from '../../providers/collection.mock';
import type { CollectionApi } from '../../providers/collection.provider';
import CollectionPage from './collection.page';

// Las descripciones del corpus entran en el recorte de ocho líneas, así que con ellas el acceso a la
// descripción completa no aparece nunca. Esta variante lo hace visible, con el texto pasando por el
// mismo pipeline que el del backend.
const [firstCollection] = onoffCollectionsMock;
const collectionWithLongDescription: Collection = createCollection({
	...firstCollection,
	slug: `${firstCollection.slug}-descripcion-larga`,
	description: markdownToSanitizedHtml(
		createMarkdown(
			[
				'Una antología literaria, pública y de temática abierta, conformada voluntariamente por escritos de quienes integran la comunidad. Abarca los géneros narrativo, lírico, dramático y didáctico.',
				'La primera versión se publicó en junio. De momento permanece abierta y suma los escritos aceptados el primer día de cada mes, con el agradecimiento a quienes participan de cada tirada.',
				'Para participar hay que ser parte de la comunidad al momento de presentar el escrito, no haber alcanzado el límite de dos obras publicadas, y no haber empleado inteligencia artificial en su creación.',
				'Del formato: la prosa va de cuarenta a cinco mil quinientas palabras y el verso de tres a ciento cincuenta versos. La recepción abre del primero al veinte de cada mes.',
			].join('\n\n'),
		),
	),
});

const catalogue: readonly Collection[] = [...onoffCollectionsMock, collectionWithLongDescription];

// Resuelve por slug contra el corpus, en vez de devolver siempre la misma colección: así el control
// mueve la página entera, y un slug que no existe cae en el estado de colección inexistente, que también
// es parte de lo que hay que poder mirar. El doble del provider no sirve acá porque nunca falla.
class CorpusCollectionApi implements CollectionApi {
	public getBySlug(slug: string): Observable<Collection> {
		const collection = catalogue.find((candidate) => candidate.slug === slug);
		return collection
			? of(collection)
			: throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }));
	}

	public getAll(): Observable<CollectionTeaser[]> {
		return of(onoffCollectionTeasersMock);
	}
}

const corpusSlugLabels = {
	...Object.fromEntries(onoffCollectionsMock.map(({ slug, title }) => [slug, title])),
	[collectionWithLongDescription.slug]: `${collectionWithLongDescription.title} (descripción larga)`,
};

type CollectionPageArgs = { slug: string };

const meta: Meta<CollectionPageArgs> = {
	component: CollectionPage,
	title: 'Páginas/CollectionPage',
	decorators: [
		applicationConfig({
			providers: [provideRouter([]), provideCollectionApiMock(new CorpusCollectionApi())],
		}),
	],
	parameters: {
		layout: 'fullscreen',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>La página de una colección, <strong>CollectionPage</strong>, montada sobre el corpus de Onoff. Como el resto de las entradas bajo <strong>Páginas</strong>, no cataloga un componente sino el ensamblado completo: las dos columnas, el listado de obras y la información de la colección con su acceso a la descripción entera.</p><p>El único control reproduce lo que la ruta le entrega: <code>slug</code>, qué colección se abre. Un slug que no existe cae en el estado de colección inexistente.</p><p>Se compone de <a href="./?path=/docs/componentes-v3-literaryworkteasercard--docs" target="_top"><strong>LiteraryWorkTeaserCard</strong></a> (el listado), <a href="./?path=/docs/componentes-v3-collectioninfopanel--docs" target="_top"><strong>CollectionInfoPanel</strong></a> (la columna y el contenido del panel deslizable), <a href="./?path=/docs/componentes-v3-navigablecollectionteaser--docs" target="_top"><strong>NavigableCollectionTeaser</strong></a> (las sugeridas) y <a href="./?path=/docs/componentes-v3-drawer--docs" target="_top"><strong>Drawer</strong></a>.</p><p>Dos cosas solo se ven acá, porque dependen de medidas reales: el acceso <strong>"Leer más"</strong> aparece únicamente si la descripción desborda su recorte de ocho líneas, y el recorte del extracto de cada obra cambia según la colección muestre o no a sus autores.</p><p>El encabezado fijo de la aplicación no se monta en el catálogo, así que el margen superior de la página se ve como espacio en blanco.</p></div>`,
			},
		},
	},
	argTypes: {
		slug: {
			name: 'Colección',
			control: { type: 'select', labels: corpusSlugLabels },
			options: catalogue.map(({ slug }) => slug),
			table: { type: { summary: 'string' } },
		},
	},
};

export default meta;
type Story = StoryObj<CollectionPageArgs>;

const [collectionShowingAuthors, collectionHidingAuthors] = onoffCollectionsMock;

export const Playground: Story = {
	args: { slug: collectionShowingAuthors.slug },
	parameters: {
		docs: {
			description: {
				story: `<p>La página completa con el control vivo. Cambiá <strong>Colección</strong> para recorrer el corpus: cambian el listado, la portada —que resuelve sus dos formas— y la información de la columna.</p>`,
			},
		},
	},
};

export const ConAutoresVisibles: Story = {
	args: { slug: collectionShowingAuthors.slug },
	parameters: {
		docs: {
			description: {
				story: `<p>Una colección que muestra a sus autores: cada tarjeta los nombra y, por eso, al extracto le queda una línea menos.</p><p><strong>Usos:</strong> antologías de varios autores, donde saber quién firma cada obra es parte de la lectura.</p>`,
			},
		},
	},
};

export const SinAutoresVisibles: Story = {
	args: { slug: collectionHidingAuthors.slug },
	parameters: {
		docs: {
			description: {
				story: `<p>Una colección que oculta a sus autores: sin la línea del autor, el extracto dispone de una línea más. Es la única diferencia entre los dos montajes del listado, y se decide en la colección y no en la tarjeta.</p><p><strong>Usos:</strong> colecciones de un solo autor, o donde la autoría no encabeza la lectura.</p>`,
			},
		},
	},
};

export const AccesoALaDescripcionCompleta: Story = {
	args: { slug: collectionWithLongDescription.slug },
	parameters: {
		docs: {
			description: {
				story: `<p>Una colección cuya descripción no entra en el recorte de ocho líneas: la columna ofrece <strong>"Leer más"</strong>, y al pedirlo se abre el panel deslizable con el texto entero, sus etiquetas y las colecciones sugeridas.</p><p>Es la única entrada donde ese flujo se puede ver: las descripciones del corpus entran completas en el recorte, así que con ellas el acceso no aparece — que es exactamente lo que tiene que pasar.</p>`,
			},
		},
	},
};

export const ColeccionInexistente: Story = {
	args: { slug: 'una-coleccion-que-no-existe' },
	parameters: {
		docs: {
			description: {
				story: `<p>El estado de colección inexistente. En la aplicación servida, además, la respuesta sale con el código que corresponde: 404 cuando la colección no existe y 503 ante cualquier otro fallo, para que un error transitorio no se cachee como si fuera la página.</p>`,
			},
		},
	},
};

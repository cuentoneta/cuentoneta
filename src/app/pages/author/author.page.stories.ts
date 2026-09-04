import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular-vite';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError, type Observable } from 'rxjs';

import type { AuthorProfile, AuthorTeaser } from '@models/author.model';
import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import { authorMock, authorTeaserMock } from '@mocks/author.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';

import { provideAuthorApiMock } from '../../providers/author.mock';
import { provideLiteraryWorkApiMock } from '../../providers/literary-work.mock';
import type { AuthorApi } from '../../providers/author.provider';
import type { LiteraryWorkApi, LiteraryWorkTeaserFilter } from '../../providers/literary-work.provider';
import AuthorPage from './author.page';

const [literaryWork] = onoffLiteraryWorksMock;

// El escenario que el diseño rotula "Few stories and info": biografía que entra en el recorte y sin
// recursos web, de modo que ni el acceso a leerla entera ni el bloque de recursos se dibujan.
const authorWithLittleInfo: AuthorProfile = {
	...authorMock,
	slug: `${authorMock.slug}-poca-info`,
	resources: [],
	biography: markdownToSanitizedHtml(
		createMarkdown(
			'**François Onoff** (Lyon, 1948 - París, 1994) fue un escritor y editor francés, fundador de la editorial que lleva su apellido.',
		),
	),
};

// Un autor cargado en el CMS sin obras publicadas todavía: alcanzable en producción, y el único lugar
// donde el listado vacío y el rótulo «0 obras» se pueden mirar.
const authorWithoutWorks: AuthorProfile = { ...authorMock, slug: `${authorMock.slug}-sin-obras` };

const roster: readonly AuthorProfile[] = [authorMock, authorWithLittleInfo, authorWithoutWorks];

// Resuelve por slug contra el corpus, en vez de devolver siempre el mismo autor: así el control mueve la
// página entera, y un slug que no existe cae en el estado de autor inexistente, que también es parte de
// lo que hay que poder mirar. El doble del provider no sirve acá porque nunca falla.
class CorpusAuthorApi implements AuthorApi {
	public getBySlug(slug: string): Observable<AuthorProfile> {
		const author = roster.find((candidate) => candidate.slug === slug);
		return author ? of(author) : throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }));
	}

	public getAll(): Observable<AuthorTeaser[]> {
		return of([authorTeaserMock]);
	}
}

// El corpus embebe un solo autor, así que filtrar por el slug real de cada variante devolvería siempre
// una lista vacía. El doble reparte por slug: las dos fichas con obras comparten el listado del corpus, y
// la del autor sin obras es la única que recibe la lista vacía.
class CorpusLiteraryWorkApi implements LiteraryWorkApi {
	public getBySlug(): Observable<LiteraryWork> {
		return of(literaryWork);
	}

	public getTeasers(filter: LiteraryWorkTeaserFilter = {}): Observable<LiteraryWorkTeaser[]> {
		return of(filter.author === authorWithoutWorks.slug ? [] : [...onoffLiteraryWorkTeasersMock]);
	}
}

const corpusSlugLabels = {
	[authorMock.slug]: authorMock.name,
	[authorWithLittleInfo.slug]: `${authorWithLittleInfo.name} (poca información)`,
	[authorWithoutWorks.slug]: `${authorWithoutWorks.name} (sin obras)`,
};

type AuthorPageArgs = { slug: string };

const meta: Meta<AuthorPageArgs> = {
	component: AuthorPage,
	title: 'Páginas/AuthorPage',
	decorators: [
		applicationConfig({
			providers: [
				provideRouter([]),
				provideAuthorApiMock(new CorpusAuthorApi()),
				provideLiteraryWorkApiMock(new CorpusLiteraryWorkApi()),
			],
		}),
	],
	parameters: {
		layout: 'fullscreen',
		docs: {
			canvas: { sourceState: 'shown' },
			description: {
				component: `<div><p>La ficha de un autor, <strong>AuthorPage</strong>, montada sobre el corpus de Onoff. Como el resto de las entradas bajo <strong>Páginas</strong>, no cataloga un componente sino el ensamblado completo: las dos columnas, el listado de obras del autor y la columna de perfil con su acceso a la biografía entera.</p><p>El único control reproduce lo que la ruta le entrega: <code>slug</code>, qué autor se abre. Un slug que no existe cae en el estado de autor inexistente.</p><p>Se compone de <a href="./?path=/docs/componentes-v3-literaryworkteasercard--docs" target="_top"><strong>LiteraryWorkTeaserCard</strong></a> (el listado), <a href="./?path=/docs/componentes-v3-authorinfopanel--docs" target="_top"><strong>AuthorInfoPanel</strong></a> (la columna y el contenido del panel deslizable), <strong>Resource</strong> (los enlaces web) y <a href="./?path=/docs/componentes-v3-drawer--docs" target="_top"><strong>Drawer</strong></a>.</p><p>Dos cosas solo se ven acá, porque dependen de medidas reales: el acceso <strong>"Leer más"</strong> aparece únicamente si la biografía desborda su recorte de ocho líneas, y la columna de perfil acompaña el scroll del listado en lugar de irse con el flujo.</p><p>El encabezado fijo de la aplicación no se monta en el catálogo, así que el margen superior de la página se ve como espacio en blanco.</p></div>`,
			},
		},
	},
	argTypes: {
		slug: {
			name: 'Autor',
			control: { type: 'select', labels: corpusSlugLabels },
			options: roster.map(({ slug }) => slug),
			table: { type: { summary: 'string' } },
		},
	},
};

export default meta;
type Story = StoryObj<AuthorPageArgs>;

export const Playground: Story = {
	args: { slug: authorMock.slug },
	parameters: {
		docs: {
			description: {
				story: `<p>La página completa con el control vivo. Cambiá <strong>Autor</strong> para recorrer los dos escenarios que el diseño cubre.</p>`,
			},
		},
	},
};

export const ConRecursosYBiografiaLarga: Story = {
	args: { slug: authorMock.slug },
	parameters: {
		docs: {
			description: {
				story: `<p>El escenario que el diseño rotula <strong>"Many stories and info"</strong>: la biografía no entra en el recorte de ocho líneas, así que la columna ofrece <strong>"Leer más"</strong>, y al pedirlo se abre el panel deslizable con el texto entero y los enlaces web.</p><p><strong>Usos:</strong> autores con ficha completa cargada en el CMS.</p>`,
			},
		},
	},
};

export const SinRecursosNiBiografiaLarga: Story = {
	args: { slug: authorWithLittleInfo.slug },
	parameters: {
		docs: {
			description: {
				story: `<p>El escenario que el diseño rotula <strong>"Few stories and info"</strong>: la biografía entra completa en su recorte y el autor no tiene recursos web, así que ni el acceso a leerla entera ni el bloque de enlaces se dibujan — que es exactamente lo que tiene que pasar.</p><p><strong>Usos:</strong> autores recién incorporados, con la ficha mínima.</p>`,
			},
		},
	},
};

export const SinObrasPublicadas: Story = {
	args: { slug: authorWithoutWorks.slug },
	parameters: {
		docs: {
			description: {
				story: `<p>Un autor cargado en el CMS al que todavía no se le publicó ninguna obra: el rótulo enuncia <strong>«0 obras»</strong> y la columna del listado queda vacía, con el perfil intacto.</p><p><strong>Usos:</strong> autores incorporados por adelantado, antes de que su primera obra salga.</p>`,
			},
		},
	},
};

export const AutorInexistente: Story = {
	args: { slug: 'un-autor-que-no-existe' },
	parameters: {
		docs: {
			description: {
				story: `<p>El estado de autor inexistente. En la aplicación servida, además, la respuesta sale con el código que corresponde: 404 cuando el autor no existe y 503 ante cualquier otro fallo, para que un error transitorio no se cachee como si fuera la ficha.</p>`,
			},
		},
	},
};

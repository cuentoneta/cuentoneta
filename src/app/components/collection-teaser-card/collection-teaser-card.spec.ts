// Librería de pruebas
import { render, screen, within } from '@testing-library/angular';
import { provideRouter } from '@angular/router';

// Componentes
import { CollectionTeaserCard } from './collection-teaser-card';

// Mocks
import {
	geometriasDelDesveloCollectionTeaserMock,
	inventarioDeLasPasionesCollectionTeaserMock,
} from '@mocks/onoff-collections.mock';

// Modelos
import { createCollectionTeaser, type CollectionTeaser } from '@models/collection.model';
import { absurdoTagMock, colaborativaTagMock, surrealismoTagMock } from '@mocks/onoff-tags.mock';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

// Utilidades de test
import { clearAllMocks } from '@test-utils';

const representativeMock = geometriasDelDesveloCollectionTeaserMock;
const sampleMock = inventarioDeLasPasionesCollectionTeaserMock;

// Deriva una variante del canon pasando por la factory, no por spread: el agregado está congelado y
// armarlo a mano saltearía las invariantes que la factory existe para hacer cumplir.
function teaserFrom(base: CollectionTeaser, overrides: Partial<Parameters<typeof createCollectionTeaser>[0]>) {
	return createCollectionTeaser({
		_id: base._id,
		slug: base.slug,
		title: base.title,
		description: base.description,
		imagery: base.imagery,
		tags: base.tags,
		config: base.config,
		mediaSources: base.mediaSources,
		count: base.count,
		...overrides,
	});
}

describe('CollectionTeaserCard', () => {
	const defaultProviders = [provideRouter([])];

	beforeEach(() => {
		clearAllMocks();
	});

	describe('Renderizado del componente', () => {
		it('should render an article element', async () => {
			await render(CollectionTeaserCard, {
				inputs: { collection: representativeMock },
				providers: defaultProviders,
			});

			expect(screen.getByRole('article')).toBeInTheDocument();
		});

		it('should not render link when collection is undefined', async () => {
			await render(CollectionTeaserCard, { providers: defaultProviders });

			expect(screen.getByRole('article')).toBeInTheDocument();
			expect(screen.queryByRole('link')).not.toBeInTheDocument();
		});
	});

	describe('Enlace de navegación', () => {
		it('should link to the collection page, not to the storylist one', async () => {
			await render(CollectionTeaserCard, {
				inputs: { collection: representativeMock },
				providers: defaultProviders,
			});

			expect(screen.getByRole('link')).toHaveAttribute('href', `/collection/${representativeMock.slug}`);
		});
	});

	// La descripción llega como `SanitizedHtml` del pipeline del backend: se pinta como marcación, no
	// como texto. Sin el bypass del sanitizer, el navegador recibiría los tags escapados.
	describe('Descripción', () => {
		it('renders the description as markup, not as escaped text', async () => {
			await render(CollectionTeaserCard, {
				inputs: { collection: representativeMock },
				providers: defaultProviders,
			});

			const description = screen.getByTestId('description');
			expect(description.innerHTML).toContain('<p>');
			expect(description.textContent).not.toContain('<p>');
		});

		// Con la descripción envuelta en el enlace de la tarjeta, un enlace propio de la prosa producía
		// marcación inválida: el parser cerraba el enlace externo antes de tiempo y expulsaba el bloque de
		// texto fuera de él, con lo que la tarjeta se desarmaba. El corpus no tiene descripciones con
		// enlaces, así que el caso se deriva.
		it('should keep the card intact when the description carries links of its own', async () => {
			const conEnlace = teaserFrom(representativeMock, {
				description: markdownToSanitizedHtml(
					createMarkdown('Una colección con [un enlace propio](https://www.cuentoneta.ar/about) en la prosa.'),
				),
			});

			const { container } = await render(CollectionTeaserCard, {
				inputs: { collection: conEnlace },
				providers: defaultProviders,
			});

			// No se afirma la ausencia de `a a`: al ser marcación inválida el parser la deshace sola, así que
			// tampoco aparecía cuando el defecto estaba vivo. Lo que distingue una versión de otra es en qué
			// queda la tarjeta después de esa reparación — antes, la portada quedaba dentro del enlace y el
			// bloque de texto salía despedido a hermano suyo.
			/* eslint-disable testing-library/no-container, testing-library/no-node-access -- la estructura resultante no se expresa por rol ni por texto */
			const article = container.querySelector('article');
			expect([...(article?.children ?? [])].map((child) => child.tagName)).toEqual(['SECTION', 'SECTION']);
			/* eslint-enable testing-library/no-container, testing-library/no-node-access */
			expect(
				within(screen.getByTestId('description')).getByRole('link', { name: 'un enlace propio' }),
			).toBeInTheDocument();
		});
	});

	// La forma de la portada la resuelve CollectionCover y la cubre su spec: acá solo se afirma que la
	// tarjeta le entrega el dato de dominio, que es lo único suyo en juego.
	// El título es lo que titula la tarjeta dentro de un listado, así que tiene que ser un encabezado:
	// sin eso, una grilla de tarjetas no ofrece nada por donde saltar con un lector de pantalla.
	describe('Título como encabezado', () => {
		it('should expose the title as a heading that links to the collection', async () => {
			await render(CollectionTeaserCard, {
				inputs: { collection: representativeMock },
				providers: defaultProviders,
			});

			const heading = screen.getByRole('heading', { name: representativeMock.title });
			expect(within(heading).getByRole('link')).toHaveAttribute('href', `/collection/${representativeMock.slug}`);
		});
	});

	describe('Etiquetas', () => {
		it('should announce the remaining tags with a counter', async () => {
			const conVariasEtiquetas = teaserFrom(representativeMock, {
				tags: [colaborativaTagMock, surrealismoTagMock, absurdoTagMock],
			});

			await render(CollectionTeaserCard, { inputs: { collection: conVariasEtiquetas }, providers: defaultProviders });

			expect(screen.getByText(new RegExp(`${colaborativaTagMock.title}\\s*\\+2`))).toBeInTheDocument();
		});

		it('should not add a counter when the collection carries a single tag', async () => {
			const conUnaEtiqueta = teaserFrom(representativeMock, { tags: [colaborativaTagMock] });

			await render(CollectionTeaserCard, { inputs: { collection: conUnaEtiqueta }, providers: defaultProviders });

			expect(screen.getByText(colaborativaTagMock.title)).toBeInTheDocument();
			expect(screen.queryByText(/\+\d/)).not.toBeInTheDocument();
		});
	});

	describe('Portada', () => {
		it('should hand the imagery of the collection to the cover', async () => {
			await render(CollectionTeaserCard, {
				inputs: { collection: sampleMock },
				providers: defaultProviders,
			});

			expect(screen.getByTestId('cover-fan')).toBeInTheDocument();
		});
	});

	describe('Título de la colección', () => {
		it('should render title inside the link', async () => {
			await render(CollectionTeaserCard, {
				inputs: { collection: representativeMock },
				providers: defaultProviders,
			});

			const link = screen.getByRole('link');
			expect(within(link).getByText(representativeMock.title)).toBeInTheDocument();
		});
	});

	// El contador cuenta obras literarias, que es lo que la colección agrupa.
	describe('Footer con tag y contador de obras', () => {
		it('should display the literary work count', async () => {
			await render(CollectionTeaserCard, {
				inputs: { collection: representativeMock },
				providers: defaultProviders,
			});

			expect(screen.getByText(`${representativeMock.count} obras`)).toBeInTheDocument();
		});

		it('should say "obra" for a collection of a single work', async () => {
			await render(CollectionTeaserCard, {
				inputs: { collection: teaserFrom(representativeMock, { count: 1 }) },
				providers: defaultProviders,
			});

			expect(screen.getByText('1 obra')).toBeInTheDocument();
		});

		it('should display the tag', async () => {
			await render(CollectionTeaserCard, {
				inputs: { collection: representativeMock },
				providers: defaultProviders,
			});

			const [tag] = representativeMock.tags;
			expect(screen.getByText(tag.title, { exact: false })).toBeInTheDocument();
		});
	});

	describe('Inputs del componente', () => {
		it('should have undefined collection by default', async () => {
			const { fixture } = await render(CollectionTeaserCard, { providers: defaultProviders });

			expect(fixture.componentInstance.collection()).toBeUndefined();
		});

		it('should update when collection input changes', async () => {
			const { fixture } = await render(CollectionTeaserCard, {
				inputs: { collection: representativeMock },
				providers: defaultProviders,
			});

			fixture.componentRef.setInput('collection', sampleMock);
			fixture.detectChanges();

			expect(screen.getByText(sampleMock.title)).toBeInTheDocument();
		});
	});

	describe('Accesibilidad', () => {
		it('should have a decorative cover and the link named by the collection title', async () => {
			await render(CollectionTeaserCard, {
				inputs: { collection: representativeMock },
				providers: defaultProviders,
			});

			expect(screen.getByTestId('cover-image')).toHaveAttribute('alt', '');
			const link = screen.getByRole('link');
			expect(within(link).getByText(representativeMock.title)).toBeInTheDocument();
		});
	});
});

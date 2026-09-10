// Librería de pruebas
import { render, screen, within } from '@testing-library/angular';
import { provideRouter } from '@angular/router';

// Componentes
import { CollectionTeaserCard } from './collection-teaser-card';

// Mocks
import {
	onoffCollectionTeasersWithLinkedDescriptionMock,
	onoffCollectionTeasersWithMultipleTagsMock,
	onoffCollectionTeasersWithRepresentativeImageryMock,
	onoffCollectionTeasersWithSampleImageryMock,
	onoffCollectionTeasersWithSingleTagMock,
	singleLiteraryWorkCollectionTeaserMock,
} from '@mocks/onoff-collections.mock';

// Utilidades de test
import { clearAllMocks } from '@test-utils';

const [representativeMock] = onoffCollectionTeasersWithRepresentativeImageryMock;
const [sampleMock] = onoffCollectionTeasersWithSampleImageryMock;

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
		it('should link to the collection page', async () => {
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

		// Que la prosa no traiga enlaces lo garantiza el ACL, y lo cubre su propio spec: acá se afirma la
		// consecuencia, que es el único destino de la tarjeta.
		it('should leave the card with a single destination', async () => {
			const [conProsaEnlazada] = onoffCollectionTeasersWithLinkedDescriptionMock;

			await render(CollectionTeaserCard, { inputs: { collection: conProsaEnlazada }, providers: defaultProviders });

			expect(screen.getAllByRole('link')).toHaveLength(1);
			expect(screen.getByRole('link')).toHaveAttribute('href', `/collection/${conProsaEnlazada.slug}`);
		});
	});

	// La forma de la portada la resuelve CollectionCover y la cubre su spec: acá solo se afirma que la
	// tarjeta le entrega el dato de dominio, que es lo único suyo en juego.
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
		it('should render the title as a heading that links to the collection', async () => {
			await render(CollectionTeaserCard, {
				inputs: { collection: representativeMock },
				providers: defaultProviders,
			});

			const heading = screen.getByRole('heading', { name: representativeMock.title });
			expect(within(heading).getByRole('link')).toHaveAttribute('href', `/collection/${representativeMock.slug}`);
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
				inputs: { collection: singleLiteraryWorkCollectionTeaserMock },
				providers: defaultProviders,
			});

			expect(screen.getByText('1 obra')).toBeInTheDocument();
		});

		it('should display the tag', async () => {
			const [conUnaEtiqueta] = onoffCollectionTeasersWithSingleTagMock;

			await render(CollectionTeaserCard, {
				inputs: { collection: conUnaEtiqueta },
				providers: defaultProviders,
			});

			expect(screen.getByText(conUnaEtiqueta.tags[0].title)).toBeInTheDocument();
			expect(screen.queryByText(/\+\d/)).not.toBeInTheDocument();
		});

		it('should announce the tags it does not name with a counter', async () => {
			const [conVariasEtiquetas] = onoffCollectionTeasersWithMultipleTagsMock;
			const [primera, ...resto] = conVariasEtiquetas.tags;

			await render(CollectionTeaserCard, { inputs: { collection: conVariasEtiquetas }, providers: defaultProviders });

			expect(screen.getByText(new RegExp(`${primera.title}\\s*\\+${resto.length}`))).toBeInTheDocument();
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

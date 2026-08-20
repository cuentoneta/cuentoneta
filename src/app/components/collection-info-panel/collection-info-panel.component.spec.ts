// Librería de pruebas
import { render, screen, within } from '@testing-library/angular';

// Componentes
import { CollectionInfoPanelComponent } from './collection-info-panel.component';

// Mocks
import {
	onoffCollectionsWithRepresentativeImageryMock,
	onoffCollectionsWithSampleImageryMock,
} from '@mocks/onoff-collections.mock';
import { cuentoTagMock, ensayoTagMock, novelaTagMock } from '@mocks/onoff-tags.mock';

// Modelos
import { createCollection, type Collection } from '@models/collection.model';

// Utilidades de test
import { clearAllMocks } from '@test-utils';

const [representativeMock] = onoffCollectionsWithRepresentativeImageryMock;
const [sampleMock] = onoffCollectionsWithSampleImageryMock;

const availableTags = [cuentoTagMock, novelaTagMock, ensayoTagMock];

// Deriva una variante del canon pasando por la factory, no por spread: el agregado está congelado y
// armarlo a mano saltearía las invariantes que la factory existe para hacer cumplir.
function collectionWithTags(base: Collection, count: number): Collection {
	return createCollection({ ...base, tags: availableTags.slice(0, count) });
}

describe('CollectionInfoPanelComponent', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	describe('sin colección', () => {
		it('should render its skeleton', async () => {
			await render(CollectionInfoPanelComponent);

			expect(screen.getByTestId('collection-info-panel-skeleton')).toBeInTheDocument();
			expect(screen.queryByTestId('description')).not.toBeInTheDocument();
		});
	});

	describe('con colección', () => {
		it('should render the title', async () => {
			await render(CollectionInfoPanelComponent, { inputs: { collection: representativeMock } });

			expect(screen.getByText(representativeMock.title)).toBeInTheDocument();
		});

		// El panel deslizable ya nombra la colección en su encabezado: repetirlo la anunciaría dos veces.
		it('should omit the title when the consumer already shows it', async () => {
			await render(CollectionInfoPanelComponent, {
				inputs: { collection: representativeMock, showTitle: false },
			});

			expect(screen.queryByText(representativeMock.title)).not.toBeInTheDocument();
		});

		// La marcación tiene que sobrevivir: sin el bypass, el sanitizer de Angular recorta un HTML que el
		// backend ya acotó a su allow-list, y el énfasis de la prosa se pierde sin que nada falle.
		it('should preserve the markup of the sanitized description', async () => {
			await render(CollectionInfoPanelComponent, { inputs: { collection: representativeMock } });

			const description = screen.getByTestId('description');
			expect(description).not.toBeEmptyDOMElement();
			expect(within(description).getAllByRole('paragraph').length).toBeGreaterThan(0);
		});

		// Todas las etiquetas del dominio, no la primera: recortar acá escondería en silencio las demás.
		// El corpus trae una sola por colección, así que el caso se deriva por la factory con tres — con
		// una, una plantilla que pintara `tags[0]` pasaría igual y el test no probaría nada.
		it('should render every tag of the collection', async () => {
			const collection = collectionWithTags(representativeMock, 3);
			await render(CollectionInfoPanelComponent, { inputs: { collection } });

			const tags = screen.getByTestId('tags');
			expect(collection.tags).toHaveLength(3);
			collection.tags.forEach((tag) => expect(within(tags).getByText(tag.title)).toBeInTheDocument());
		});

		it('should omit the tag list when the collection has none', async () => {
			await render(CollectionInfoPanelComponent, {
				inputs: { collection: { ...representativeMock, tags: [] } },
			});

			expect(screen.queryByTestId('tags')).not.toBeInTheDocument();
		});
	});

	describe('portada', () => {
		it('should render a single cover for representative imagery', async () => {
			await render(CollectionInfoPanelComponent, { inputs: { collection: representativeMock } });

			expect(screen.queryByTestId('cover-fan')).not.toBeInTheDocument();
			expect(screen.getAllByTestId('cover')).toHaveLength(1);
		});

		it('should render the three-cover fan for sample imagery', async () => {
			await render(CollectionInfoPanelComponent, { inputs: { collection: sampleMock } });

			expect(within(screen.getByTestId('cover-fan')).getAllByTestId('cover')).toHaveLength(3);
		});
	});

	describe('recorte de la descripción', () => {
		// Cuántas líneas se muestran depende del alto de la columna que lo hospeda, así que lo decide el
		// consumidor: sin ese dato el panel no recorta.
		it('should not clamp when the consumer does not ask for it', async () => {
			await render(CollectionInfoPanelComponent, { inputs: { collection: representativeMock } });

			expect(screen.getByTestId('description').className).not.toMatch(/line-clamp-/);
		});

		it('should clamp to the requested number of lines', async () => {
			await render(CollectionInfoPanelComponent, {
				inputs: { collection: representativeMock, descriptionLines: 8 },
			});

			expect(screen.getByTestId('description')).toHaveClass('line-clamp-8');
		});

		// El safelist de Tailwind llega hasta 10: pedir más produciría una clase que no existe.
		it('should cap the clamp at the highest safelisted value', async () => {
			await render(CollectionInfoPanelComponent, {
				inputs: { collection: representativeMock, descriptionLines: 40 },
			});

			expect(screen.getByTestId('description')).toHaveClass('line-clamp-10');
		});
	});
});

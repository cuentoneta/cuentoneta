// Librería de pruebas
import { render, screen, within } from '@testing-library/angular';

// Componentes
import { CollectionCoverComponent } from './collection-cover.component';

// Mocks
import {
	onoffCollectionsWithRepresentativeImageryMock,
	onoffCollectionsWithSampleImageryMock,
} from '@mocks/onoff-collections.mock';

// Utilidades de test
import { clearAllMocks } from '@test-utils';

const [representativeMock] = onoffCollectionsWithRepresentativeImageryMock;
const [sampleMock] = onoffCollectionsWithSampleImageryMock;

const representativeImagery = representativeMock.imagery;
const sampleImagery = sampleMock.imagery;

describe('CollectionCoverComponent', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	it('should render a single cover for representative imagery', async () => {
		await render(CollectionCoverComponent, { inputs: { imagery: representativeImagery } });

		expect(screen.getAllByTestId('cover-image')).toHaveLength(1);
		expect(screen.queryByTestId('cover-fan')).not.toBeInTheDocument();
	});

	it('should render the three-cover fan for sample imagery', async () => {
		await render(CollectionCoverComponent, { inputs: { imagery: sampleImagery } });

		expect(within(screen.getByTestId('cover-fan')).getAllByTestId('cover-image')).toHaveLength(3);
	});

	// El placeholder lo aporta CoverImage: un slot sin imagen no deja un hueco, dibuja su marcador.
	it('should fall back to the placeholder on empty slots of the fan', async () => {
		const imagery = {
			kind: 'sample',
			images: [sampleImagery.kind === 'sample' ? sampleImagery.images[0] : '', '', ''],
		} as const;
		await render(CollectionCoverComponent, { inputs: { imagery } });

		expect(screen.getAllByTestId('cover-image')).toHaveLength(1);
		expect(screen.getAllByTestId('cover-placeholder')).toHaveLength(2);
	});

	describe('prioridad de carga', () => {
		// Tres candidatas a ser la imagen más grande de la pantalla son ninguna: solo la del frente
		// se marca, que es la que se ve entera.
		it('should mark only the front cover of the fan as priority', async () => {
			await render(CollectionCoverComponent, { inputs: { imagery: sampleImagery, priority: true } });

			const prioritised = screen
				.getAllByTestId('cover-image')
				.filter((image) => image.getAttribute('fetchpriority') === 'high');
			expect(prioritised).toHaveLength(1);
		});

		it('should mark the representative cover as priority', async () => {
			await render(CollectionCoverComponent, { inputs: { imagery: representativeImagery, priority: true } });

			expect(screen.getByTestId('cover-image')).toHaveAttribute('fetchpriority', 'high');
		});
	});

	// El orden de apilamiento dentro del componente no lo cubre ningún otro gate, y es lo que hace que
	// la portada del frente se vea al frente.
	it('should confine its stacking order, with the front cover above the sides', async () => {
		await render(CollectionCoverComponent, { inputs: { imagery: sampleImagery } });

		const [front, ...sides] = screen.getAllByTestId('fan-slot');

		expect(screen.getByTestId('cover-fan')).toHaveClass('isolate');
		expect(front).toHaveClass('z-raised');
		sides.forEach((side) => expect(side).toHaveClass('z-content'));
	});
});

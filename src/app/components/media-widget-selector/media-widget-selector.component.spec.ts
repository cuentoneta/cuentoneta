import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { isAudioRecording } from '@models/media.model';
import { MediaWidgetSelector } from './media-widget-selector.component';
import {
	onoffLiteraryWorksWithMultipleMediaSources,
	onoffLiteraryWorksWithSingleMediaSource,
} from '@mocks/onoff-literary-works.mock';

// Las obras se toman por capacidad y no por slug: lo que separa los dos comportamientos del componente
// es la cantidad de medios, así que el selector del corpus expresa la precondición del caso.
const [multipleSourcesWork] = onoffLiteraryWorksWithMultipleMediaSources;
const [singleSourceWork] = onoffLiteraryWorksWithSingleMediaSource;

describe('MediaWidgetSelector', () => {
	describe('con varios medios', () => {
		it('should offer one button per media source', async () => {
			await render(MediaWidgetSelector, {
				componentInputs: { mediaSources: multipleSourcesWork.mediaSources },
			});

			expect(screen.getAllByRole('button')).toHaveLength(multipleSourcesWork.mediaSources.length);
		});

		it('should announce the choice in the heading', async () => {
			await render(MediaWidgetSelector, {
				componentInputs: { mediaSources: multipleSourcesWork.mediaSources },
			});

			expect(screen.getByRole('heading', { name: /diferentes formatos/i })).toBeInTheDocument();
		});

		it('should mount the first media source before any interaction', async () => {
			await render(MediaWidgetSelector, {
				componentInputs: { mediaSources: multipleSourcesWork.mediaSources },
			});

			const [firstButton] = screen.getAllByRole('button');
			expect(firstButton).toHaveAttribute('aria-pressed', 'true');
		});

		// Por `aria-pressed` y no por el color: es la única señal de la elección que un lector de pantalla
		// recibe, así que un cambio que pinte el botón pero no mueva el atributo debe fallar acá.
		it('should move the pressed state to the clicked media source', async () => {
			await render(MediaWidgetSelector, {
				componentInputs: { mediaSources: multipleSourcesWork.mediaSources },
			});

			const [firstButton, secondButton] = screen.getAllByRole('button');
			await userEvent.setup().click(secondButton);

			expect(secondButton).toHaveAttribute('aria-pressed', 'true');
			expect(firstButton).toHaveAttribute('aria-pressed', 'false');
		});

		it('should mount the widget of the clicked media source', async () => {
			const [, secondSource] = multipleSourcesWork.mediaSources;
			await render(MediaWidgetSelector, {
				componentInputs: { mediaSources: multipleSourcesWork.mediaSources },
			});

			await userEvent.setup().click(screen.getAllByRole('button')[1]);

			expect(screen.getByText(secondSource.title)).toBeInTheDocument();
		});
	});

	describe('con un solo medio', () => {
		it('should mount the widget without offering a choice', async () => {
			await render(MediaWidgetSelector, {
				componentInputs: { mediaSources: singleSourceWork.mediaSources },
			});

			expect(screen.queryAllByRole('button')).toHaveLength(0);
			expect(screen.getByTestId('audio-recording')).toBeInTheDocument();
		});

		it('should keep the heading visible with its own wording', async () => {
			await render(MediaWidgetSelector, {
				componentInputs: { mediaSources: singleSourceWork.mediaSources },
			});

			expect(screen.getByRole('heading', { name: /otro formato/i })).toBeInTheDocument();
		});
	});

	// El corpus no tiene una obra que repita un tipo, así que la precondición se compone de dos que sí
	// existen: los cuatro medios de una obra que los declara todos, más el audio de la que declara uno.
	// La composición vive acá y no como selector del corpus porque no describe la capacidad de ninguna
	// obra del canon; el día que exista, el selector reemplaza a estas dos líneas.
	describe('con un tipo repetido', () => {
		const repeatedTypeSources = [...multipleSourcesWork.mediaSources, ...singleSourceWork.mediaSources];
		// Por el guard del modelo y no por el tag: es lo que estrecha `data` a la forma del audio, que
		// es donde vive la url con la que se distingue un widget montado del otro.
		const audioSources = repeatedTypeSources.filter(isAudioRecording);

		it('should offer every media source, including the repeated ones', async () => {
			await render(MediaWidgetSelector, {
				componentInputs: { mediaSources: repeatedTypeSources },
			});

			expect(screen.getAllByRole('button')).toHaveLength(repeatedTypeSources.length);
			expect(audioSources.length).toBeGreaterThan(1);
		});

		// El nombre del formato deja de distinguir en cuanto el tipo se repite: dos botones "Audiolibro"
		// serían indistinguibles entre sí.
		it('should label the repeated type by the title of each media source', async () => {
			await render(MediaWidgetSelector, {
				componentInputs: { mediaSources: repeatedTypeSources },
			});

			audioSources.forEach((media) => {
				expect(screen.getByRole('button', { name: media.title })).toBeInTheDocument();
			});
			expect(screen.queryByRole('button', { name: 'Audiolibro' })).not.toBeInTheDocument();
		});

		it('should keep the format name on the types that appear once', async () => {
			await render(MediaWidgetSelector, {
				componentInputs: { mediaSources: repeatedTypeSources },
			});

			expect(screen.getByRole('button', { name: 'YouTube' })).toBeInTheDocument();
		});

		// La prueba de que los botones repetidos no son el mismo: montan medios distintos.
		it('should mount a different widget for each of the repeated media sources', async () => {
			const [firstAudio, secondAudio] = audioSources;
			await render(MediaWidgetSelector, {
				componentInputs: { mediaSources: repeatedTypeSources },
			});

			await userEvent.setup().click(screen.getByRole('button', { name: firstAudio.title }));
			expect(screen.getByTestId('audio-recording')).toHaveAttribute('src', firstAudio.data.url);

			await userEvent.setup().click(screen.getByRole('button', { name: secondAudio.title }));
			expect(screen.getByTestId('audio-recording')).toHaveAttribute('src', secondAudio.data.url);
		});
	});

	describe('sin medios', () => {
		it('should render nothing at all', async () => {
			await render(MediaWidgetSelector, { componentInputs: { mediaSources: [] } });

			expect(screen.queryByRole('heading')).not.toBeInTheDocument();
			expect(screen.queryAllByRole('button')).toHaveLength(0);
		});
	});
});

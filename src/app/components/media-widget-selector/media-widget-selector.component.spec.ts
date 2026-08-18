import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
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

	describe('sin medios', () => {
		it('should render nothing at all', async () => {
			await render(MediaWidgetSelector, { componentInputs: { mediaSources: [] } });

			expect(screen.queryByRole('heading')).not.toBeInTheDocument();
			expect(screen.queryAllByRole('button')).toHaveLength(0);
		});
	});
});

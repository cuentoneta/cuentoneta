import { render, screen } from '@testing-library/angular';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryCardSkeletonComponent } from './story-card-skeleton.component';
import { StoryEditionDateLabelComponent } from '../story-edition-date-label/story-edition-date-label.component';
import { ThemeService } from '../../providers/theme.service';

// Mock del ThemeService.
const mockThemeService = {
	pickColor: jest.fn().mockReturnValue('#d1d5db'),
};

describe('StoryCardSkeletonComponent', () => {
	const setup = async (
		inputs: Partial<{
			animation: 'progress' | 'progress-dark' | 'pulse' | 'false' | false;
			displayDate: boolean;
			editionLabel: string;
			comingNextLabel: string;
			displayFooter: boolean;
		}> = {},
	) => {
		return await render(StoryCardSkeletonComponent, {
			imports: [NgxSkeletonLoaderModule, StoryEditionDateLabelComponent],
			providers: [{ provide: ThemeService, useValue: mockThemeService }],
			inputs: {
				animation: false,
				displayDate: false,
				editionLabel: '',
				comingNextLabel: '',
				displayFooter: true,
				...inputs,
			},
		});
	};

	test('should render successfully', async () => {
		const view = await setup();
		expect(view).toBeTruthy();
	});

	test('should display skeleton loaders by default', async () => {
		await setup();

		// Verificar que el artículo tenga el atributo aria-busy.
		const article = screen.getByRole('article');
		expect(article).toHaveAttribute('aria-busy', 'true');

		// Verificar que se muestran los skeleton loaders por su rol de progressbar.
		const skeletonLoaders = screen.getAllByRole('progressbar');
		expect(skeletonLoaders.length).toBeGreaterThan(0);
	});

	test('should show coming next label when provided', async () => {
		const comingNextLabel = 'Próximamente';
		await setup({ comingNextLabel });

		// Verificar que se muestra el label de "próximamente".
		expect(screen.getByText(comingNextLabel)).toBeInTheDocument();
	});

	test('should show edition label when displayDate is true and comingNextLabel is provided', async () => {
		const editionLabel = 'Edición Especial';
		const comingNextLabel = 'Próximamente';
		await setup({
			displayDate: true,
			editionLabel,
			comingNextLabel,
		});

		// Cuando displayDate es true, debe mostrar editionLabel en lugar de comingNextLabel.
		expect(screen.getByText(editionLabel)).toBeInTheDocument();
		expect(screen.queryByText(comingNextLabel)).not.toBeInTheDocument();
	});

	test('should hide footer when displayFooter is false', async () => {
		await setup({ displayFooter: false });

		// Verificar que no se muestra el separador hr del footer.
		const separator = screen.queryByRole('separator');
		expect(separator).not.toBeInTheDocument();
	});

	test('should show footer when displayFooter is true', async () => {
		await setup({ displayFooter: true });

		// Verificar que se muestra el separador hr del footer.
		const separator = screen.getByRole('separator');
		expect(separator).toBeInTheDocument();
	});

	test('should apply correct CSS classes', async () => {
		await setup();

		const article = screen.getByRole('article');
		expect(article).toHaveClass('card', 'flex', 'flex-col', 'gap-2', 'border-1', 'border-solid', 'border-primary-300');
	});

	test('should use theme service for skeleton color', async () => {
		await setup();

		// Verificar que se llama al ThemeService.
		expect(mockThemeService.pickColor).toHaveBeenCalledWith('zinc', 300);
	});
});

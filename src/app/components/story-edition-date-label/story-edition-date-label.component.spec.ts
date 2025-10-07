import { render, screen } from '@testing-library/angular';
import { StoryEditionDateLabelComponent } from './story-edition-date-label.component';

describe('StoryEditionDateLabelComponent', () => {
	it('should create', async () => {
		const { container } = await render(StoryEditionDateLabelComponent, {
			inputs: {
				label: 'Día 1',
			},
		});
		expect(container).toBeTruthy();
	});

	it('should display label when provided', async () => {
		await render(StoryEditionDateLabelComponent, {
			inputs: {
				label: 'Día 1',
			},
		});

		const label = screen.getByText('Día 1');
		expect(label).toBeInTheDocument();
	});

	it('should not display label when not provided', async () => {
		await render(StoryEditionDateLabelComponent, {
			inputs: {
				label: undefined,
			},
		});

		const labelSpan = screen.queryByText(/Día/);
		expect(labelSpan).not.toBeInTheDocument();
	});

	it('should display "NUEVO" badge when markAsNew is true', async () => {
		await render(StoryEditionDateLabelComponent, {
			inputs: {
				label: 'Día 1',
				markAsNew: true,
			},
		});

		const badge = screen.getByText('NUEVO');
		expect(badge).toBeInTheDocument();
	});

	it('should not display "NUEVO" badge when markAsNew is false', async () => {
		await render(StoryEditionDateLabelComponent, {
			inputs: {
				label: 'Día 1',
				markAsNew: false,
			},
		});

		const badge = screen.queryByText('NUEVO');
		expect(badge).not.toBeInTheDocument();
	});

	it('should display both label and badge together', async () => {
		await render(StoryEditionDateLabelComponent, {
			inputs: {
				label: 'Día 5',
				markAsNew: true,
			},
		});

		const label = screen.getByText('Día 5');
		const badge = screen.getByText('NUEVO');

		expect(label).toBeInTheDocument();
		expect(badge).toBeInTheDocument();
	});

	it('should render visual indicator (colored bar) with label', async () => {
		const { container } = await render(StoryEditionDateLabelComponent, {
			inputs: {
				label: 'Día 10',
			},
		});

		const visualIndicator = container.querySelector('.h-\\[12px\\].w-\\[2px\\].bg-primary-500');
		expect(visualIndicator).toBeInTheDocument();
	});
});

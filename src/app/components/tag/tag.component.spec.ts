import { TagComponent } from './tag.component';
import { render, screen } from '@testing-library/angular';

describe('TagComponent', () => {
	it('should render the label', async () => {
		await render(TagComponent, { inputs: { label: 'Crónica' } });
		expect(screen.getByText('Crónica')).toBeInTheDocument();
	});

	it('should apply the soft variant by default and sentence-case the label', async () => {
		await render(TagComponent, { inputs: { label: 'CRÓNICA', variant: 'soft' } });
		const tag = screen.getByText('Crónica');
		expect(tag).toHaveClass('text-xs', 'text-brand-500');
		expect(tag).not.toHaveClass('bg-brand-50');
	});

	it('should apply the filled variant chrome and keep the label text (uppercase via CSS)', async () => {
		await render(TagComponent, { inputs: { label: 'crónica', variant: 'filled' } });
		expect(screen.getByText('crónica')).toHaveClass('bg-brand-50', 'text-brand-500', 'text-xxs', 'uppercase');
	});

	it('should apply the gray variant chrome and sentence-case the label', async () => {
		await render(TagComponent, { inputs: { label: 'crónica', variant: 'gray' } });
		expect(screen.getByText('Crónica')).toHaveClass('bg-neutral-950-40', 'text-neutral-50', 'text-xxs');
	});

	it('should apply inline background and text colors when both are provided', async () => {
		await render(TagComponent, {
			inputs: { label: 'Cumpleaños', variant: 'filled', backgroundColor: '#FFD700', textColor: '#000000' },
		});
		const tag = screen.getByText('Cumpleaños');
		expect(tag).toHaveStyle({ backgroundColor: '#FFD700', color: '#000000' });
	});

	it('should apply only background color when only backgroundColor is provided', async () => {
		await render(TagComponent, { inputs: { label: 'Especial', backgroundColor: 'gold' } });
		const tag = screen.getByText('Especial');
		expect(tag).toHaveStyle({ backgroundColor: 'gold' });
		expect(tag.style.color).toBe('');
	});

	it('should not apply inline colors when neither backgroundColor nor textColor is provided', async () => {
		await render(TagComponent, { inputs: { label: 'Normal', variant: 'soft' } });
		const tag = screen.getByText('Normal');
		expect(tag.style.backgroundColor).toBe('');
		expect(tag.style.color).toBe('');
	});
});

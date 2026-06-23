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
});

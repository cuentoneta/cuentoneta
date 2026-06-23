import { TagComponent } from './tag.component';
import { render, screen } from '@testing-library/angular';

describe('TagComponent', () => {
	it('should render the label', async () => {
		await render(TagComponent, { inputs: { label: 'Crónica' } });
		expect(screen.getByText('Crónica')).toBeInTheDocument();
	});

	it('should apply the soft variant by default (text only, no background)', async () => {
		await render(TagComponent, { inputs: { label: 'Crónica' } });
		const tag = screen.getByText('Crónica');
		expect(tag).toHaveClass('text-xs', 'text-brand-500');
		expect(tag).not.toHaveClass('bg-brand-50');
	});

	it('should apply the filled variant chrome (uppercase pill)', async () => {
		await render(TagComponent, { inputs: { label: 'Crónica', variant: 'filled' } });
		expect(screen.getByText('Crónica')).toHaveClass('bg-brand-50', 'text-brand-500', 'text-xxs', 'uppercase');
	});

	it('should apply the gray variant chrome (translucent pill)', async () => {
		await render(TagComponent, { inputs: { label: 'Crónica', variant: 'gray' } });
		expect(screen.getByText('Crónica')).toHaveClass('bg-neutral-950-40', 'text-neutral-50', 'text-xxs');
	});

	it('should sentence-case the label in the soft variant', async () => {
		await render(TagComponent, { inputs: { label: 'CRÓNICA', variant: 'soft' } });
		expect(screen.getByText('Crónica')).toBeInTheDocument();
	});

	it('should sentence-case the label in the gray variant', async () => {
		await render(TagComponent, { inputs: { label: 'crónica', variant: 'gray' } });
		expect(screen.getByText('Crónica')).toBeInTheDocument();
	});

	it('should preserve the label text in the filled variant (uppercase is applied via CSS)', async () => {
		await render(TagComponent, { inputs: { label: 'crónica', variant: 'filled' } });
		expect(screen.getByText('crónica')).toHaveClass('uppercase');
	});
});

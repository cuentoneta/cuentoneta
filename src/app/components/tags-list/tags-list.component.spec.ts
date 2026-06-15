import { restoreAllMocks, spyOn } from '@test-utils';
import { TagsListComponent } from './tags-list.component';
import { TagComponent } from '../tag/tag.component';
import { render, screen } from '@testing-library/angular';
import {
	installIntersectionObserverStub,
	lastObserverOptions,
	markOutsideViewport,
} from '../../testing/intersection-observer.stub';

// Los tags se proyectan: la API del componente es por content projection. Se les da variant 'gray'
// para verificar que el contador toma la variante de los tags proyectados.
const renderList = (labels: string[]) =>
	render(
		`<cuentoneta-tags-list>
			@for (label of labels; track label) {
				<cuentoneta-tag [label]="label" variant="gray" />
			}
		</cuentoneta-tags-list>`,
		{ imports: [TagsListComponent, TagComponent], componentProperties: { labels } },
	);

describe('TagsListComponent', () => {
	beforeEach(() => installIntersectionObserverStub());
	afterEach(() => restoreAllMocks());

	it('should project and render the tags, with no counter when they all fit', async () => {
		await renderList(['Crónica', 'Ensayo', 'Memoria']);
		for (const label of ['Crónica', 'Ensayo', 'Memoria']) {
			expect(screen.getByText(label)).toBeInTheDocument();
		}
		expect(screen.queryByTestId('tags-overflow')).not.toBeInTheDocument();
	});

	it('should show the "+N" counter on overflow, taking the variant from the projected tags', async () => {
		const { fixture } = await renderList(['A', 'B', 'C', 'D', 'E']);

		markOutsideViewport(screen.getByText('D'), screen.getByText('E'));
		await fixture.whenStable();

		const counter = screen.getByTestId('tags-overflow');
		expect(counter).toHaveTextContent('+2');
		expect(counter).toHaveClass('bg-neutral-950-40');
	});

	it('should reserve the measured counter width in the observer', async () => {
		spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(30);
		const { fixture } = await renderList(['A', 'B', 'C', 'D', 'E']);

		markOutsideViewport(screen.getByText('D'), screen.getByText('E'));
		await fixture.whenStable();

		expect(lastObserverOptions()?.rootMargin).toBe('0px -30px 0px 0px');
	});

	it('should not show a counter when no tag is projected', async () => {
		await renderList([]);
		expect(screen.queryByTestId('tags-overflow')).not.toBeInTheDocument();
	});
});

import { TagsListComponent } from './tags-list.component';
import { TagComponent } from '../tag/tag.component';
import { render, screen } from '@testing-library/angular';

// jsdom no implementa IntersectionObserver. El stub captura el callback para simular, en los tests,
// que ciertos tags no entran en el contenedor (intersectionRatio < 1).
let intersectionCallback: IntersectionObserverCallback | undefined;
class IntersectionObserverStub {
	constructor(callback: IntersectionObserverCallback) {
		intersectionCallback = callback;
	}
	observe(): void {
		return;
	}
	disconnect(): void {
		return;
	}
}

/** Simula que los tags dados quedaron fuera del contenedor (overflow). */
const markOverflowing = (...elements: Element[]) =>
	intersectionCallback?.(
		elements.map((target) => ({ target, intersectionRatio: 0 }) as IntersectionObserverEntry),
		{} as IntersectionObserver,
	);

// Los tags se proyectan: la API del componente es por content projection.
const renderList = (labels: string[], maxVisible?: number) =>
	render(
		`<cuentoneta-tags-list [maxVisible]="maxVisible">
			@for (label of labels; track label) {
				<cuentoneta-tag [label]="label" />
			}
		</cuentoneta-tags-list>`,
		{ imports: [TagsListComponent, TagComponent], componentProperties: { labels, maxVisible } },
	);

describe('TagsListComponent', () => {
	beforeAll(() => {
		(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IntersectionObserverStub;
	});

	beforeEach(() => (intersectionCallback = undefined));

	it('proyecta y renderiza todos los tags provistos', async () => {
		await renderList(['Crónica', 'Ensayo', 'Memoria']);
		for (const label of ['Crónica', 'Ensayo', 'Memoria']) {
			expect(screen.getByText(label)).toBeInTheDocument();
		}
	});

	it('muestra todos los tags y ningún contador cuando entran en el ancho', async () => {
		await renderList(['A', 'B', 'C', 'D']);
		for (const label of ['A', 'B', 'C', 'D']) {
			expect(screen.getByText(label)).not.toHaveStyle({ visibility: 'hidden' });
		}
		expect(screen.queryByTestId('tags-overflow')).not.toBeInTheDocument();
	});

	it('colapsa con "+N" los tags que no entran por ancho y los oculta con visibility:hidden', async () => {
		const { fixture } = await renderList(['A', 'B', 'C', 'D', 'E']);

		markOverflowing(screen.getByText('D'), screen.getByText('E'));
		await fixture.whenStable();

		expect(screen.getByTestId('tags-overflow')).toHaveTextContent('+2');
		expect(screen.getByText('C')).not.toHaveStyle({ visibility: 'hidden' });
		expect(screen.getByText('D')).toHaveStyle({ visibility: 'hidden' });
		expect(screen.getByText('E')).toHaveStyle({ visibility: 'hidden' });
	});

	it('respeta maxVisible como tope duro aunque haya ancho de sobra', async () => {
		await renderList(['A', 'B', 'C', 'D', 'E'], 2);

		expect(screen.getByTestId('tags-overflow')).toHaveTextContent('+3');
		expect(screen.getByText('B')).not.toHaveStyle({ visibility: 'hidden' });
		expect(screen.getByText('C')).toHaveStyle({ visibility: 'hidden' });
	});

	it('no muestra contador cuando no se proyecta ningún tag', async () => {
		await renderList([]);
		expect(screen.queryByTestId('tags-overflow')).not.toBeInTheDocument();
	});
});

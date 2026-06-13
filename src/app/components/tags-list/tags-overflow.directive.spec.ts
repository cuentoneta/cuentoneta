import { Component, inject } from '@angular/core';
import { render, screen } from '@testing-library/angular';

import { TagsOverflowDirective } from './tags-overflow.directive';
import { TagComponent } from '../tag/tag.component';

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

// Host de prueba que usa la directiva como hostDirective y proyecta tags, tal como TagsListComponent.
@Component({
	selector: 'cuentoneta-test-overflow-host',
	imports: [TagComponent],
	hostDirectives: [{ directive: TagsOverflowDirective, inputs: ['maxVisible'] }],
	template: `
		<ng-content />
		@if (overflow.hiddenCount() > 0) {
			<span [style.left.px]="overflow.counterLeft()" data-testid="counter">+{{ overflow.hiddenCount() }}</span>
		}
	`,
	host: { class: 'relative flex overflow-hidden' },
})
class TestOverflowHostComponent {
	protected readonly overflow = inject(TagsOverflowDirective);
}

const renderHost = (labels: string[], maxVisible?: number) =>
	render(
		`<cuentoneta-test-overflow-host [maxVisible]="maxVisible">
			@for (label of labels; track label) {
				<cuentoneta-tag [label]="label" />
			}
		</cuentoneta-test-overflow-host>`,
		{
			imports: [TestOverflowHostComponent, TagComponent],
			componentProperties: { labels, maxVisible },
		},
	);

describe('TagsOverflowDirective', () => {
	beforeAll(() => {
		(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IntersectionObserverStub;
	});

	beforeEach(() => (intersectionCallback = undefined));

	it('descubre los tags proyectados y los muestra todos cuando entran', async () => {
		await renderHost(['A', 'B', 'C']);
		for (const label of ['A', 'B', 'C']) {
			expect(screen.getByText(label)).not.toHaveStyle({ visibility: 'hidden' });
		}
		expect(screen.queryByTestId('counter')).not.toBeInTheDocument();
	});

	it('expone hiddenCount y oculta los tags que el observer reporta fuera del contenedor', async () => {
		const { fixture } = await renderHost(['A', 'B', 'C', 'D', 'E']);

		markOverflowing(screen.getByText('D'), screen.getByText('E'));
		await fixture.whenStable();

		expect(screen.getByTestId('counter')).toHaveTextContent('+2');
		expect(screen.getByText('C')).not.toHaveStyle({ visibility: 'hidden' });
		expect(screen.getByText('D')).toHaveStyle({ visibility: 'hidden' });
		expect(screen.getByText('E')).toHaveStyle({ visibility: 'hidden' });
	});

	it('vuelve a mostrar los tags si el observer reporta que entran de nuevo', async () => {
		const { fixture } = await renderHost(['A', 'B', 'C', 'D', 'E']);

		markOverflowing(screen.getByText('D'), screen.getByText('E'));
		await fixture.whenStable();
		expect(screen.getByTestId('counter')).toHaveTextContent('+2');

		intersectionCallback?.(
			[
				{ target: screen.getByText('D'), intersectionRatio: 1 } as IntersectionObserverEntry,
				{ target: screen.getByText('E'), intersectionRatio: 1 } as IntersectionObserverEntry,
			],
			{} as IntersectionObserver,
		);
		await fixture.whenStable();
		expect(screen.queryByTestId('counter')).not.toBeInTheDocument();
		expect(screen.getByText('E')).not.toHaveStyle({ visibility: 'hidden' });
	});

	it('respeta maxVisible como tope duro aunque haya ancho de sobra', async () => {
		await renderHost(['A', 'B', 'C', 'D', 'E'], 2);

		expect(screen.getByTestId('counter')).toHaveTextContent('+3');
		expect(screen.getByText('B')).not.toHaveStyle({ visibility: 'hidden' });
		expect(screen.getByText('C')).toHaveStyle({ visibility: 'hidden' });
	});

	it('el ancho manda cuando es más restrictivo que maxVisible', async () => {
		const { fixture } = await renderHost(['A', 'B', 'C', 'D', 'E'], 4);

		markOverflowing(screen.getByText('C'), screen.getByText('D'), screen.getByText('E'));
		await fixture.whenStable();

		expect(screen.getByTestId('counter')).toHaveTextContent('+3');
		expect(screen.getByText('B')).not.toHaveStyle({ visibility: 'hidden' });
		expect(screen.getByText('C')).toHaveStyle({ visibility: 'hidden' });
	});

	it('posiciona el contador al final del último tag visible (counterLeft)', async () => {
		const { fixture } = await renderHost(['A', 'B', 'C']);
		// jsdom no hace layout: simulamos la geometría del último tag visible (B, tras ocultar C).
		const b = screen.getByText('B');
		Object.defineProperty(b, 'offsetLeft', { configurable: true, value: 40 });
		Object.defineProperty(b, 'offsetWidth', { configurable: true, value: 30 });

		markOverflowing(screen.getByText('C'));
		await fixture.whenStable();

		// counterLeft = offsetLeft(40) + offsetWidth(30) + gap(6) = 76
		expect(screen.getByTestId('counter')).toHaveStyle({ left: '76px' });
	});
});

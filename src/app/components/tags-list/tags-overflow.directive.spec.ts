import { Component, inject } from '@angular/core';
import { render, screen } from '@testing-library/angular';

import { TagsOverflowDirective } from './tags-overflow.directive';
import { TagComponent } from '../tag/tag.component';
import {
	installIntersectionObserverStub,
	markInsideViewport,
	markOutsideViewport,
} from '../../testing/intersection-observer.stub';

// Host de prueba que usa la directiva como hostDirective y proyecta tags, tal como TagsListComponent.
@Component({
	selector: 'cuentoneta-test-overflow-host',
	imports: [TagComponent],
	hostDirectives: [{ directive: TagsOverflowDirective, inputs: ['maxVisible'] }],
	template: `
		<ng-content />
		@if (overflow.hiddenCount() > 0) {
			<span data-testid="counter">+{{ overflow.hiddenCount() }}</span>
		}
	`,
	host: { class: 'flex overflow-hidden' },
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
	beforeEach(() => installIntersectionObserverStub());

	it('should discover the projected tags and show them all when they fit', async () => {
		await renderHost(['A', 'B', 'C']);
		for (const label of ['A', 'B', 'C']) {
			expect(screen.getByText(label)).not.toHaveStyle({ visibility: 'hidden' });
		}
		expect(screen.queryByTestId('counter')).not.toBeInTheDocument();
	});

	it('should expose hiddenCount and hide the tags the observer reports outside the container', async () => {
		const { fixture } = await renderHost(['A', 'B', 'C', 'D', 'E']);

		markOutsideViewport(screen.getByText('D'), screen.getByText('E'));
		await fixture.whenStable();

		expect(screen.getByTestId('counter')).toHaveTextContent('+2');
		expect(screen.getByText('C')).not.toHaveStyle({ visibility: 'hidden' });
		expect(screen.getByText('D')).toHaveStyle({ visibility: 'hidden' });
		expect(screen.getByText('E')).toHaveStyle({ visibility: 'hidden' });
	});

	it('should show the tags again when the observer reports them back inside', async () => {
		const { fixture } = await renderHost(['A', 'B', 'C', 'D', 'E']);

		markOutsideViewport(screen.getByText('D'), screen.getByText('E'));
		await fixture.whenStable();
		expect(screen.getByTestId('counter')).toHaveTextContent('+2');

		markInsideViewport(screen.getByText('D'), screen.getByText('E'));
		await fixture.whenStable();
		expect(screen.queryByTestId('counter')).not.toBeInTheDocument();
		expect(screen.getByText('E')).not.toHaveStyle({ visibility: 'hidden' });
	});

	it('should respect maxVisible as a hard cap even with spare width', async () => {
		await renderHost(['A', 'B', 'C', 'D', 'E'], 2);

		expect(screen.getByTestId('counter')).toHaveTextContent('+3');
		expect(screen.getByText('B')).not.toHaveStyle({ visibility: 'hidden' });
		expect(screen.getByText('C')).toHaveStyle({ visibility: 'hidden' });
	});

	it('should let width win when it is more restrictive than maxVisible', async () => {
		const { fixture } = await renderHost(['A', 'B', 'C', 'D', 'E'], 4);

		markOutsideViewport(screen.getByText('C'), screen.getByText('D'), screen.getByText('E'));
		await fixture.whenStable();

		expect(screen.getByTestId('counter')).toHaveTextContent('+3');
		expect(screen.getByText('B')).not.toHaveStyle({ visibility: 'hidden' });
		expect(screen.getByText('C')).toHaveStyle({ visibility: 'hidden' });
	});
});

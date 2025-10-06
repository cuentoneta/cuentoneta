import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Component } from '@angular/core';
import Tab from './tab.component';
import Tabs from './tabs.component';

@Component({
	selector: 'test-host',
	imports: [Tabs, Tab],
	template: `
		<cuentoneta-tabs [initialTabIndex]="initialTabIndex">
			<cuentoneta-tab title="Tab 1">
				<p>Content 1</p>
			</cuentoneta-tab>
			<cuentoneta-tab title="Tab 2">
				<p>Content 2</p>
			</cuentoneta-tab>
			<cuentoneta-tab title="Tab 3">
				<p>Content 3</p>
			</cuentoneta-tab>
		</cuentoneta-tabs>
	`,
})
class TestHostComponent {
	initialTabIndex = 0;
}

describe('TabsComponent', () => {
	it('should create', async () => {
		const { container } = await render(TestHostComponent);
		expect(container).toBeTruthy();
	});

	it('should render all tab buttons', async () => {
		await render(TestHostComponent);

		const buttons = screen.getAllByRole('tab');
		expect(buttons.length).toBe(3);
		expect(buttons[0]).toHaveTextContent('Tab 1');
		expect(buttons[1]).toHaveTextContent('Tab 2');
		expect(buttons[2]).toHaveTextContent('Tab 3');
	});

	it('should set first tab as active by default', async () => {
		await render(TestHostComponent);

		const buttons = screen.getAllByRole('tab');
		expect(buttons[0]).toHaveAttribute('aria-selected', 'true');

		const tabPanel = screen.getByRole('tabpanel');
		expect(tabPanel).toHaveTextContent('Content 1');
	});

	it('should change active tab when clicking on another tab', async () => {
		const user = userEvent.setup();
		await render(TestHostComponent);

		const buttons = screen.getAllByRole('tab');

		await user.click(buttons[1]);

		expect(buttons[0]).toHaveAttribute('aria-selected', 'false');
		expect(buttons[1]).toHaveAttribute('aria-selected', 'true');

		const tabPanel = screen.getByRole('tabpanel');
		expect(tabPanel).toHaveTextContent('Content 2');
	});

	it('should apply correct CSS classes to active tab', async () => {
		await render(TestHostComponent);

		const buttons = screen.getAllByRole('tab');

		expect(buttons[0]).toHaveClass('border-primary-400');
		expect(buttons[0]).toHaveClass('text-primary-500');
		expect(buttons[1]).toHaveClass('border-gray-200');
		expect(buttons[1]).toHaveClass('text-gray-600');
	});

	it('should support initialTabIndex input', async () => {
		await render(TestHostComponent, {
			componentProperties: {
				initialTabIndex: 1,
			},
		});

		const buttons = screen.getAllByRole('tab');
		expect(buttons[1]).toHaveAttribute('aria-selected', 'true');

		const tabPanel = screen.getByRole('tabpanel');
		expect(tabPanel).toHaveTextContent('Content 2');
	});

	it('should have proper ARIA attributes', async () => {
		await render(TestHostComponent);

		const tablist = screen.getByRole('tablist');
		expect(tablist).toBeInTheDocument();

		const tabpanel = screen.getByRole('tabpanel');
		expect(tabpanel).toBeInTheDocument();
		expect(tabpanel).toHaveAttribute('aria-labelledby', 'Tab 1');
	});

	it('should update tabpanel content when switching tabs', async () => {
		const user = userEvent.setup();
		await render(TestHostComponent);

		const buttons = screen.getAllByRole('tab');
		const tabPanel = screen.getByRole('tabpanel');

		expect(tabPanel).toHaveTextContent('Content 1');

		await user.click(buttons[2]);

		expect(tabPanel).toHaveTextContent('Content 3');
	});
});

import { render, screen } from '@testing-library/angular';
import { EpigraphComponent } from './epigraph.component';
import { epigraphMock } from 'src/app/mocks/epigraph-mock';

describe('EpigraphComponent', () => {
	const setup = async () =>
		await render(EpigraphComponent, {
			inputs: { epigraph: epigraphMock },
		});

	it('should render the component', async () => {
		const { container } = await setup();

		expect(container).toBeInTheDocument();
	});

	it('should display text reference', async () => {
		await setup();

		expect(screen.getByText('El libro de las maravillas de antaño y de hace poco')).toBeInTheDocument();
	});
});

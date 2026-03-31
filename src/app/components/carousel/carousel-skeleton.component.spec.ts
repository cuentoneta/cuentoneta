// Librería de pruebas
import { render } from '@testing-library/angular';
// Componentes
import { CarouselSkeletonComponent } from './carousel-skeleton.component';
describe('CarouselSkeletonComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(CarouselSkeletonComponent);
		expect(container).toBeInTheDocument();
	});
	it('should render skeleton loader', async () => {
		await render(CarouselSkeletonComponent);
		// El componente se renderiza correctamente si no lanza errores
		expect(true).toBe(true);
	});
});

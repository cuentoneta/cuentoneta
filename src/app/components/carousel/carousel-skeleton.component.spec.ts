// Librería de pruebas
import { render, screen } from '@testing-library/angular';

// Componentes
import { CarouselSkeletonComponent } from './carousel-skeleton.component';

describe('CarouselSkeletonComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(CarouselSkeletonComponent);
		expect(container).toBeInTheDocument();
	});

	// El esqueleto reserva el lugar del carousel, así que su relación de aspecto tiene que cambiar en
	// el mismo breakpoint que la del componente real (`carousel.component.html`). Cuando no coinciden,
	// el contenido salta al reemplazar al esqueleto en la franja entre ambos breakpoints.
	it('should switch aspect ratio at the same breakpoint as the carousel', async () => {
		await render(CarouselSkeletonComponent);
		expect(screen.getByRole('status')).toHaveClass('aspect-[540/220]', 'sm:aspect-[1240/360]');
	});
});

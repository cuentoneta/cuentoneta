// Librería de pruebas
import { render, screen } from '@testing-library/angular';

// Componentes
import { CarouselSkeletonComponent } from './carousel-skeleton.component';

describe('CarouselSkeletonComponent', () => {
	it('should render the component', async () => {
		const { container } = await render(CarouselSkeletonComponent);
		expect(container).toBeInTheDocument();
	});

	it('should render skeleton loader for image', async () => {
		const { container } = await render(CarouselSkeletonComponent);

		// Verificar que existe el skeleton loader con la clase carousel-image-skeleton
		const imageSkeleton = container.querySelector('.carousel-image-skeleton');
		expect(imageSkeleton).toBeInTheDocument();
	});

	it('should render skeleton loader for text/indicators', async () => {
		const { container } = await render(CarouselSkeletonComponent);

		// Verificar que existe el skeleton loader con la clase carousel-text-skeleton
		const textSkeleton = container.querySelector('.carousel-text-skeleton');
		expect(textSkeleton).toBeInTheDocument();
	});

	it('should apply correct aspect ratio classes', async () => {
		const { container } = await render(CarouselSkeletonComponent);

		const imageSkeleton = container.querySelector('.carousel-image-skeleton');

		// Verificar que tiene las clases de aspect ratio correctas
		expect(imageSkeleton).toHaveClass('aspect-[540/220]');
		expect(imageSkeleton).toHaveClass('md:aspect-[960/280]');
	});
});

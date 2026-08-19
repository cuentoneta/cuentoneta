import { render, screen } from '@testing-library/angular';
import { DividerComponent } from './divider.component';

// Las orientaciones se comparan con renders independientes, nunca con `rerender`: Angular Testing
// Library no reevalúa los bindings del host al reusar el fixture, así que `aria-orientation` y las
// clases quedarían con el valor del primer render y la aserción pasaría por el motivo equivocado.
const renderDivider = (template: string) => render(template, { imports: [DividerComponent] });

const bothAxes = [
	['horizontal', '<cuentoneta-divider />'],
	['vertical', '<cuentoneta-divider orientation="vertical" />'],
] as const;

describe('DividerComponent', () => {
	describe('semántica', () => {
		it('should expose the separator role', async () => {
			await renderDivider(`<cuentoneta-divider />`);
			expect(screen.getByRole('separator')).toBeInTheDocument();
		});

		it.each(bothAxes)('should announce the %s orientation', async (axis, template) => {
			await renderDivider(template);
			expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', axis);
		});

		// El separador es estructural, no un control: no proyecta contenido, no expone rol de widget
		// y no se suma al orden de tabulación. Es la invariante que enuncia la definición del diseño.
		// La focusabilidad se afirma por la ausencia de `tabindex` y no llamando a `focus()`: el DOM
		// de los tests enfoca cualquier elemento sin modelar si es focusable, así que esa vía
		// verificaría el entorno en vez del componente.
		it('should not be interactive', async () => {
			await renderDivider(`<cuentoneta-divider />`);
			const divider = screen.getByRole('separator');
			expect(divider).toBeEmptyDOMElement();
			expect(divider).not.toHaveAttribute('tabindex');
			expect(screen.queryByRole('button')).not.toBeInTheDocument();
			expect(screen.queryByRole('link')).not.toBeInTheDocument();
		});
	});

	describe('orientación horizontal', () => {
		it('should be the default orientation', async () => {
			await renderDivider(`<cuentoneta-divider />`);
			const divider = screen.getByRole('separator');
			expect(divider).toHaveClass('h-px');
			expect(divider).toHaveClass('w-full');
		});

		it('should not take the geometry of the vertical axis', async () => {
			await renderDivider(`<cuentoneta-divider orientation="horizontal" />`);
			const divider = screen.getByRole('separator');
			expect(divider).not.toHaveClass('w-px');
			expect(divider).not.toHaveClass('self-stretch');
		});
	});

	describe('orientación vertical', () => {
		it('should be one pixel wide and stretch to the available height', async () => {
			await renderDivider(`<cuentoneta-divider orientation="vertical" />`);
			const divider = screen.getByRole('separator');
			expect(divider).toHaveClass('w-px');
			expect(divider).toHaveClass('self-stretch');
		});

		it('should not take the geometry of the horizontal axis', async () => {
			await renderDivider(`<cuentoneta-divider orientation="vertical" />`);
			const divider = screen.getByRole('separator');
			expect(divider).not.toHaveClass('h-px');
			expect(divider).not.toHaveClass('w-full');
		});
	});

	describe('caja común a las dos orientaciones', () => {
		it.each(bothAxes)('should paint the neutral line on the %s axis', async (_axis, template) => {
			await renderDivider(template);
			expect(screen.getByRole('separator')).toHaveClass('bg-neutral-200');
		});

		// Sin `block` un elemento custom es inline y no toma ancho; sin `shrink-0` el único píxel se
		// comprime a cero en una fila apretada. Las dos clases son la razón de que la línea se vea.
		it.each(bothAxes)('should keep its box from collapsing on the %s axis', async (_axis, template) => {
			await renderDivider(template);
			const divider = screen.getByRole('separator');
			expect(divider).toHaveClass('block');
			expect(divider).toHaveClass('shrink-0');
		});
	});
});

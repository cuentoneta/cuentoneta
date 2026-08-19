import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { installDocumentFontsStub, resolveFontsReady } from '@testing/document-fonts.stub';
import {
	activeObserverCount,
	installResizeObserverStub,
	setMeasuredSize,
	triggerResize,
} from '@testing/resize-observer.stub';
import { ClampOverflowDirective } from './clamp-overflow.directive';

// La directiva se ejercita por su comportamiento observable —el "Leer más" aparece o no— y no leyendo
// la signal: es el contrato que consume una plantilla.
@Component({
	imports: [ClampOverflowDirective],
	template: `
		<p #clamp="cuentonetaClampOverflow" cuentonetaClampOverflow class="line-clamp-3">Un texto cualquiera</p>
		@if (clamp.isOverflowing()) {
			<button type="button">Leer más</button>
		}
	`,
})
class ClampHostComponent {}

const readMore = (): HTMLElement | null => screen.queryByRole('button', { name: 'Leer más' });

describe('ClampOverflowDirective', () => {
	beforeEach(() => {
		installResizeObserverStub();
		installDocumentFontsStub();
	});

	afterEach(() => {
		// Las medidas del prototipo son de un solo caso: dejarlas puestas las heredaría el resto.
		Reflect.deleteProperty(HTMLParagraphElement.prototype, 'scrollHeight');
		Reflect.deleteProperty(HTMLParagraphElement.prototype, 'clientHeight');
	});

	it('should not report overflow before measuring', async () => {
		await render(ClampHostComponent);

		expect(readMore()).not.toBeInTheDocument();
	});

	// El primer valor no lo produce ningún resize: un ResizeObserver entrega una medición al empezar a
	// observar. Las medidas se fijan en el prototipo porque el elemento todavía no existe cuando la
	// directiva lo observa.
	it('should report overflow from the initial observation, with no resize', async () => {
		Object.defineProperty(HTMLParagraphElement.prototype, 'scrollHeight', { value: 200, configurable: true });
		Object.defineProperty(HTMLParagraphElement.prototype, 'clientHeight', { value: 100, configurable: true });

		const { detectChanges } = await render(ClampHostComponent);
		detectChanges();

		expect(readMore()).toBeInTheDocument();
	});

	it('should report overflow when the content exceeds the visible box', async () => {
		const { detectChanges } = await render(ClampHostComponent);

		setMeasuredSize(screen.getByText('Un texto cualquiera'), { scrollHeight: 200, clientHeight: 100 });
		triggerResize();
		detectChanges();

		expect(readMore()).toBeInTheDocument();
	});

	it('should not report overflow when the content fits', async () => {
		const { detectChanges } = await render(ClampHostComponent);

		setMeasuredSize(screen.getByText('Un texto cualquiera'), { scrollHeight: 100, clientHeight: 100 });
		triggerResize();
		detectChanges();

		expect(readMore()).not.toBeInTheDocument();
	});

	// El redondeo sub-pixel del alto de línea deja un píxel de más en un texto que entra justo.
	it('should tolerate a sub-pixel difference', async () => {
		const { detectChanges } = await render(ClampHostComponent);

		setMeasuredSize(screen.getByText('Un texto cualquiera'), { scrollHeight: 101, clientHeight: 100 });
		triggerResize();
		detectChanges();

		expect(readMore()).not.toBeInTheDocument();
	});

	// El caso que una medición única no cubre: al ensancharse el host, el texto deja de recortarse.
	it('should stop reporting overflow once the content fits again', async () => {
		const { detectChanges } = await render(ClampHostComponent);
		const text = screen.getByText('Un texto cualquiera');

		setMeasuredSize(text, { scrollHeight: 200, clientHeight: 100 });
		triggerResize();
		detectChanges();
		expect(readMore()).toBeInTheDocument();

		setMeasuredSize(text, { scrollHeight: 200, clientHeight: 200 });
		triggerResize();
		detectChanges();

		expect(readMore()).not.toBeInTheDocument();
	});

	// La fuente tardía crece el contenido sin cambiar la caja, así que el observer no dispara.
	it('should re-measure once the fonts finish loading', async () => {
		await render(ClampHostComponent);

		setMeasuredSize(screen.getByText('Un texto cualquiera'), { scrollHeight: 200, clientHeight: 100 });
		resolveFontsReady();

		expect(await screen.findByRole('button', { name: 'Leer más' })).toBeInTheDocument();
	});

	it('should disconnect its observer when the view is destroyed', async () => {
		const { fixture } = await render(ClampHostComponent);
		expect(activeObserverCount()).toBe(1);

		fixture.destroy();

		expect(activeObserverCount()).toBe(0);
	});

	// La continuación de la carga de fuentes sobrevive al observer: sin cancelarla, mediría sobre una
	// vista ya destruida y escribiría estado que nadie va a leer.
	it('should not measure after the view is destroyed', async () => {
		const { fixture } = await render(ClampHostComponent);
		const directive = fixture.debugElement.query((node) => node.name === 'p').injector.get(ClampOverflowDirective);
		setMeasuredSize(screen.getByText('Un texto cualquiera'), { scrollHeight: 200, clientHeight: 100 });

		fixture.destroy();
		resolveFontsReady();
		await Promise.resolve();

		expect(directive.isOverflowing()).toBe(false);
	});
});

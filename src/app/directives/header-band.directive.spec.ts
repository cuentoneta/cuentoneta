import { Component } from '@angular/core';
import { render } from '@testing-library/angular';

import {
	installIntersectionObserverStub,
	markInsideViewport,
	markOutsideViewport,
} from '@testing/intersection-observer.stub';
import { LayoutService } from '../providers/layout.interface';
import { ControllableLayoutService } from '../providers/layout.mock';
import { HeaderBand } from './header-band.directive';

@Component({
	template: '<p>Banda</p>',
	hostDirectives: [HeaderBand],
})
class HeaderBandHost {}

describe('HeaderBand', () => {
	let layout: ControllableLayoutService;

	const renderBand = () => render(HeaderBandHost, { providers: [{ provide: LayoutService, useValue: layout }] });

	beforeEach(() => {
		installIntersectionObserverStub();
		layout = new ControllableLayoutService();
	});

	// La declaración es lo que el servidor serializa, y también el estado del primer render del
	// cliente: ninguno de los dos espera al observer, que solo existe en el navegador.
	it('should declare the band when it mounts', async () => {
		await renderBand();

		expect(layout.isHeaderOverBand()).toBe(true);
	});

	it('should release the band once it leaves the viewport', async () => {
		const { fixture } = await renderBand();
		expect(layout.isHeaderOverBand(), 'la banda no se declaró: el caso no probaría que la suelta').toBe(true);

		markOutsideViewport(fixture.nativeElement);

		expect(layout.isHeaderOverBand()).toBe(false);
	});

	// Una banda más alta que la ventana vuelve a entrar apenas se scrollea hacia arriba sobre ella.
	it('should declare the band again when it comes back into view', async () => {
		const { fixture } = await renderBand();
		markOutsideViewport(fixture.nativeElement);

		markInsideViewport(fixture.nativeElement);

		expect(layout.isHeaderOverBand()).toBe(true);
	});

	it('should release the band when the view is destroyed', async () => {
		const { fixture } = await renderBand();
		expect(layout.isHeaderOverBand(), 'la banda no se declaró: el caso no probaría que la suelta').toBe(true);

		fixture.destroy();

		expect(layout.isHeaderOverBand()).toBe(false);
	});
});

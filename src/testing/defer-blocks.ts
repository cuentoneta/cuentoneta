import { DeferBlockState, type DeferBlockFixture } from '@angular/core/testing';

// El fixture de un componente y el de un bloque diferido comparten esta operación, que es lo único
// que la recursión necesita de cada uno.
type DeferBlockHost = { getDeferBlocks(): Promise<DeferBlockFixture[]> };

/**
 * Resuelve todos los bloques diferidos de un fixture, incluidos los que quedan anidados dentro de
 * otro. En el entorno de tests los `@defer` no se disparan solos, así que sin esto se renderiza el
 * marcador de posición; y resolver un solo nivel deja sin renderizar a un componente que difiere a
 * su vez, como el despachador de sugerencias de lectura.
 */
export async function renderDeferBlocks(host: DeferBlockHost): Promise<void> {
	for (const deferBlock of await host.getDeferBlocks()) {
		await deferBlock.render(DeferBlockState.Complete);
		await renderDeferBlocks(deferBlock);
	}
}

import { Service } from '@angular/core';

import type { Drawer } from './drawer';

/**
 * Registro global de drawers: garantiza que haya un solo drawer activo a la vez y genera ids únicos para los
 * atributos aria de cada instancia. Es la única pieza con estado compartido entre instancias de `Drawer`,
 * por eso vive en un servicio singleton (`@Service()`).
 */
@Service()
export class DrawerTrackerService {
	private activeInstance: Drawer | null = null;
	private instanceCount = 0;

	public nextId(): number {
		return ++this.instanceCount;
	}

	public register(drawer: Drawer): void {
		if (this.activeInstance) {
			throw new Error('Only one drawer can be active at a time.');
		}
		this.activeInstance = drawer;
	}

	public unregister(drawer: Drawer): void {
		if (this.activeInstance === drawer) {
			this.activeInstance = null;
		}
	}
}

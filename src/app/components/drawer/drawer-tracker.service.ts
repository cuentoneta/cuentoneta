import { Injectable } from '@angular/core';

import type { DrawerComponent } from './drawer.component';

/**
 * Registro global de drawers: garantiza que haya un solo drawer activo a la vez y genera ids únicos para los
 * atributos aria de cada instancia. Es la única pieza con estado compartido entre instancias de `DrawerComponent`,
 * por eso vive en un servicio singleton (`providedIn: 'root'`).
 */
@Injectable({ providedIn: 'root' })
export class DrawerTrackerService {
	private activeInstance: DrawerComponent | null = null;
	private instanceCount = 0;

	public nextId(): number {
		return ++this.instanceCount;
	}

	public register(drawer: DrawerComponent): void {
		if (this.activeInstance) {
			throw new Error('Only one drawer can be active at a time.');
		}
		this.activeInstance = drawer;
	}

	public unregister(drawer: DrawerComponent): void {
		if (this.activeInstance === drawer) {
			this.activeInstance = null;
		}
	}
}

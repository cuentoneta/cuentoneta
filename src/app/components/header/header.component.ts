import { Component, inject } from '@angular/core';
import { Storylist } from '@models/storylist.model';
import { ContentService } from '../../providers/content.service';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
	selector: 'cuentoneta-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	standalone: true,
	imports: [CommonModule, RouterModule, NgOptimizedImage],
})
export class HeaderComponent {
	readonly navLinks: { title: string; route: string }[] = [
		{ title: 'Inicio', route: '/home' },
		{ title: 'Nosotros', route: '/about' },
	];
	lists: Pick<Storylist, 'title' | 'slug'>[] = [];
	displayMenu: boolean = false;
	constructor() {
		const contentService = inject(ContentService);
		this.lists = contentService.getNavLists();
	}

	onMenuTogglerClicked(event: MouseEvent) {
		this.displayMenu = !this.displayMenu;
	}
}

import { Component, effect, inject, input, signal } from '@angular/core';
import { NavigationFrameService } from '../providers/navigation-frame.service';
import { Router } from '@angular/router';
import { NavigationBarConfig } from '../components/storylist-navigation-frame/storylist-navigation-frame.component';

@Component({
	selector: 'cuentoneta-navigation-frame',
	template: '',
	standalone: true,
	providers: [NavigationFrameService],
})
export abstract class NavigationFrameComponent {
	// Providers
	protected router = inject(Router);
	private navigationFrameService = inject(NavigationFrameService);

	// Inputs
	readonly selectedStorySlug = input<string>();
	readonly navigationSlug = input<string>();
	readonly config = signal<NavigationBarConfig>(this.navigationFrameService.navigationBarConfig());

	protected constructor() {
		effect(() => {
			const config = this.config();
			if (config) {
				this.navigationFrameService.setNavigationBarConfig(config);
			}
		});
	}
}

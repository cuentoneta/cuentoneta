import { Injectable, signal } from '@angular/core';
import { NavigationBarConfig } from '../components/storylist-navigation-frame/storylist-navigation-frame.component';

@Injectable({
	providedIn: 'root',
})
export class NavigationFrameService {
	readonly navigationBarConfig = signal<NavigationBarConfig>({
		headerTitle: '',
		footerTitle: '',
		navigationRoute: '',
		showFooter: false,
	});

	setNavigationBarConfig(config: NavigationBarConfig) {
		this.navigationBarConfig.set(config);
	}
}

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class AnalyticsService {
	async init() {
		if (!environment.clarityProjectId) {
			return;
		}

		// Inicializa Clarity
		try {
			const clarityModule = await import('@microsoft/clarity');
			const clarity = clarityModule.default;
			clarity.init(environment.clarityProjectId);
		} catch (error) {
			console.error('Failed to initialize Clarity:', error);
		}
	}
}

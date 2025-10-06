import { Injectable } from '@angular/core';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class AnalyticsService {
	async init() {
		// Inicializa Speed Insights de Vercel
		try {
			injectSpeedInsights();
		} catch (error) {
			console.error('Failed to initialize Speed Insights:', error);
		}

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

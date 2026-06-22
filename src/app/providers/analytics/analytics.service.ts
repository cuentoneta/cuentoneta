import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoggerService } from '../logging/logger.service';

@Injectable({
	providedIn: 'root',
})
export class AnalyticsService {
	private readonly logger = inject(LoggerService);

	public async init() {
		if (!environment.clarityProjectId) {
			return;
		}

		// Inicializa Clarity
		try {
			const clarityModule = await import('@microsoft/clarity');
			const clarity = clarityModule.default;
			clarity.init(environment.clarityProjectId);
		} catch (error) {
			this.logger.error('Failed to initialize Clarity:', error);
		}
	}
}

import { Injectable } from '@angular/core';
import { AnalyticsService } from './analytics.service';

@Injectable({
	providedIn: 'root',
})
export class AnalyticsMockService extends AnalyticsService {
	async init() {}
}

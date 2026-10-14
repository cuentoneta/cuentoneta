import { Service } from '@angular/core';
import { AnalyticsService } from './analytics.service';

@Service()
export class StubAnalyticsService extends AnalyticsService {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public async init() {}
}

// Core
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

// Interfaces
import { LandingPageContent } from '@models/landing-page-content.model';

// Providers
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ContentCampaign } from '@models/content-campaign.model';

@Injectable({
	providedIn: 'root',
})
export class ContentService {
	private readonly prefix = `${environment.apiUrl}api/content`;

	// Services
	private http = inject(HttpClient);

	public getLandingPageContent() {
		return this.http.get<LandingPageContent>(`${this.prefix}/landing-page`);
	}

	public getContentCampaigns$(): Observable<ContentCampaign[]> {
		return this.getLandingPageContent().pipe(map((content) => content.campaigns));
	}
}

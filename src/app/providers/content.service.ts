// Core
import { inject, Injectable } from '@angular/core';

// Interfaces
import { LandingPageContent } from '@models/landing-page-content.model';

// Providers
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

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
}

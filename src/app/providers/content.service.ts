// Core
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

// Models
import { LandingPageContent } from '@models/landing-page-content.model';

// tRPC
import { getTRPCClient } from './trpc';

@Injectable({
	providedIn: 'root',
})
export class ContentService {
	private trpc = getTRPCClient();

	public getLandingPageContent(): Observable<LandingPageContent> {
		return from(this.trpc.content.getLandingPageContent.query());
	}
}

import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { LiteraryWork } from '@models/literary-work.model';

export interface LiteraryWorkApi {
	getBySlug(slug: string): Observable<LiteraryWork>;
}

export const LiteraryWorkApi = new InjectionToken<LiteraryWorkApi>('LiteraryWorkApi');

import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

import { Storylist } from '@models/storylist.model';

export interface StorylistApi {
	get(slug: string, amount?: number, ordering?: 'asc' | 'desc'): Observable<Storylist>;
}

export const StorylistApi = new InjectionToken<StorylistApi>('StorylistApi');

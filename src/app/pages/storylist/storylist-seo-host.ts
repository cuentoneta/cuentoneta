import { InjectionToken, type Signal } from '@angular/core';

import { type Storylist } from '@models/storylist.model';

export interface StorylistSeoHost {
	readonly storylist: Signal<Storylist | undefined>;
}

export const STORYLIST_SEO_HOST = new InjectionToken<StorylistSeoHost>('STORYLIST_SEO_HOST');

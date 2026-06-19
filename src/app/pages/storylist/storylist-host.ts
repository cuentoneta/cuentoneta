import { InjectionToken, type Signal } from '@angular/core';

import { type Storylist } from '@models/storylist.model';

export interface StorylistHost {
	readonly storylist: Signal<Storylist | undefined>;
}

export const STORYLIST_HOST = new InjectionToken<StorylistHost>('STORYLIST_HOST');

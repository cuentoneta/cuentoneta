import { InjectionToken, type Signal } from '@angular/core';

import { type Story } from '@models/story.model';

export interface StorySeoHost {
	readonly story: Signal<Story | undefined>;
}

export const STORY_SEO_HOST = new InjectionToken<StorySeoHost>('STORY_SEO_HOST');

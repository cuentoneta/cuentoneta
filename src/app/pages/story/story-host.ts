import { InjectionToken, type Signal } from '@angular/core';

import { type Story } from '@models/story.model';

export interface StoryHost {
	readonly story: Signal<Story | undefined>;
}

export const STORY_HOST = new InjectionToken<StoryHost>('STORY_HOST');

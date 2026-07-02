import { inject } from '@angular/core';
import { type ResolveFn } from '@angular/router';

import { type Story } from '@models/story.model';
import { StoryApi } from '../../providers/story-api.interface';

export const storyResolver: ResolveFn<Story> = (route) => {
	const storyApi = inject(StoryApi);
	return storyApi.getBySlug(route.paramMap.get('slug') ?? '');
};

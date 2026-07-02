import { inject } from '@angular/core';
import { type ResolveFn } from '@angular/router';

import { type Storylist } from '@models/storylist.model';
import { StorylistApi } from '../../providers/storylist-api.interface';

export const storylistResolver: ResolveFn<Storylist> = (route) => {
	const storylistApi = inject(StorylistApi);
	return storylistApi.get(route.paramMap.get('slug') ?? '', 60, 'asc');
};

import { inject } from '@angular/core';
import { type ResolveFn } from '@angular/router';

import { type AuthorProfile } from '@models/author.model';
import { AuthorApi } from '../../providers/author-api.interface';

export const authorResolver: ResolveFn<AuthorProfile> = (route) => {
	const authorApi = inject(AuthorApi);
	return authorApi.getBySlug(route.paramMap.get('slug') ?? '');
};

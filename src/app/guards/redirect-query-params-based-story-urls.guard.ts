import type { ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { createUrlTreeFromSnapshot } from '@angular/router';

export const redirectQueryParamsBasedStoryUrlsGuard = (activatedRoute: ActivatedRouteSnapshot): UrlTree => {
	const url = createUrlTreeFromSnapshot(activatedRoute, [
		activatedRoute.queryParams['slug'],
		activatedRoute.queryParams['list'],
	]);

	return url;
};

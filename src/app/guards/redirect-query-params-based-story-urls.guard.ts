import type { ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { createUrlTreeFromSnapshot } from '@angular/router';

export const redirectQueryParamsBasedStoryUrlsGuard = (activatedRoute: ActivatedRouteSnapshot): UrlTree => {
	return createUrlTreeFromSnapshot(activatedRoute, [
		activatedRoute.queryParams['slug'],
		activatedRoute.queryParams['list'],
	]);
};

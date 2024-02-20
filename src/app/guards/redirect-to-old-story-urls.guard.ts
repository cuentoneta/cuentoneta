import type { ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { createUrlTreeFromSnapshot } from '@angular/router';

export const redirectToOldStoryUrlsGuard = (activatedRoute: ActivatedRouteSnapshot): UrlTree => {
	const url = createUrlTreeFromSnapshot(activatedRoute, [
		activatedRoute.queryParams['slug'],
		activatedRoute.queryParams['list'],
	]);

	return url;
};

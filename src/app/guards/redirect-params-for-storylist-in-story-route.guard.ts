import type { ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { createUrlTreeFromSnapshot } from '@angular/router';

export const redirectParamsForStorylistInStoryRouteGuard = (activatedRoute: ActivatedRouteSnapshot): UrlTree => {
	return createUrlTreeFromSnapshot(activatedRoute, [activatedRoute.queryParams['slug']], {
		navigation: 'storylist',
		slug: activatedRoute.queryParams['list'],
	});
};

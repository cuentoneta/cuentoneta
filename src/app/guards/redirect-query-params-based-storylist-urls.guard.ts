import type { ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { createUrlTreeFromSnapshot } from '@angular/router';

export const redirectQueryParamsBasedStorylistUrlsGuard = (activatedRoute: ActivatedRouteSnapshot): UrlTree => {
	return createUrlTreeFromSnapshot(activatedRoute, [activatedRoute.queryParams['slug']]);
};

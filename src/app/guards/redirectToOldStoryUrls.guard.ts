import type { ActivatedRouteSnapshot } from '@angular/router';
import { Router, UrlTree } from '@angular/router';

import { APP_ROUTE_TREE } from '../app.routes';
import { inject } from '@angular/core';

export const redirectToOldStoryUrlsGuard = (activatedRoute: ActivatedRouteSnapshot): UrlTree => {
	const router = inject(Router);
	const url = `/${APP_ROUTE_TREE['STORY']}/${activatedRoute.queryParams['slug']}/${activatedRoute.queryParams['list']}`;

	return router.parseUrl(url);
};

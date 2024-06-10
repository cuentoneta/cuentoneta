import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AppRoutes } from '../app.routes';

export const redirectParamsForStorylistInStoryRouteGuard = (activatedRoute: ActivatedRouteSnapshot): UrlTree => {
	const router = inject(Router);
	const appRoutes = AppRoutes;

	return router.createUrlTree([appRoutes.Story, activatedRoute.params['slug']], {
		queryParams: {
			navigation: 'storylist',
			slug: activatedRoute.params['list'],
		},
	});
};

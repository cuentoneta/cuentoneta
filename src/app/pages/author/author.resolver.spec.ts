import { clearAllMocks, fn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { convertToParamMap, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { of, type Observable } from 'rxjs';

import { type AuthorProfile } from '@models/author.model';
import { authorMock } from '@mocks/author.mock';
import { AuthorApi } from '../../providers/author-api.interface';
import { authorResolver } from './author.resolver';

describe('authorResolver', () => {
	const returnedObservable: Observable<AuthorProfile> = of(authorMock);
	const getBySlug = fn<[string], Observable<AuthorProfile>>();

	function resolve(slug: string): Observable<AuthorProfile> {
		const route = { paramMap: convertToParamMap({ slug }) } as ActivatedRouteSnapshot;
		return TestBed.runInInjectionContext(() =>
			authorResolver(route, {} as RouterStateSnapshot),
		) as Observable<AuthorProfile>;
	}

	beforeEach(() => {
		clearAllMocks();
		getBySlug.mockReturnValue(returnedObservable);
		TestBed.configureTestingModule({
			providers: [{ provide: AuthorApi, useValue: { getBySlug } }],
		});
	});

	it('should call getBySlug with the slug from the route', () => {
		resolve('jorge-luis-borges');

		expect(getBySlug).toHaveBeenCalledWith('jorge-luis-borges');
	});

	it('should return the api observable without wrapping it in a promise', () => {
		const result = resolve('jorge-luis-borges');

		expect(result).toBe(returnedObservable);
	});
});

import { clearAllMocks, fn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { convertToParamMap, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { of, type Observable } from 'rxjs';

import { type Storylist } from '@models/storylist.model';
import { storylistMock } from '@mocks/storylist.mock';
import { StorylistApi } from '../../providers/storylist-api.interface';
import { storylistResolver } from './storylist.resolver';

describe('storylistResolver', () => {
	const returnedObservable: Observable<Storylist> = of(storylistMock);
	const get = fn<[string, number, 'asc' | 'desc'], Observable<Storylist>>();

	function resolve(slug: string): Observable<Storylist> {
		const route = { paramMap: convertToParamMap({ slug }) } as ActivatedRouteSnapshot;
		return TestBed.runInInjectionContext(() =>
			storylistResolver(route, {} as RouterStateSnapshot),
		) as Observable<Storylist>;
	}

	beforeEach(() => {
		clearAllMocks();
		get.mockReturnValue(returnedObservable);
		TestBed.configureTestingModule({
			providers: [{ provide: StorylistApi, useValue: { get } }],
		});
	});

	it('should call get with the slug from the route and the default paging', () => {
		resolve('cuentos-de-terror');

		expect(get).toHaveBeenCalledWith('cuentos-de-terror', 60, 'asc');
	});

	it('should return the api observable without wrapping it in a promise', () => {
		const result = resolve('cuentos-de-terror');

		expect(result).toBe(returnedObservable);
	});
});

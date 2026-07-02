import { clearAllMocks, fn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { convertToParamMap, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { of, type Observable } from 'rxjs';

import { type Story } from '@models/story.model';
import { storyMock } from '@mocks/story.mock';
import { StoryApi } from '../../providers/story-api.interface';
import { storyResolver } from './story.resolver';

describe('storyResolver', () => {
	const returnedObservable: Observable<Story> = of(storyMock);
	const getBySlug = fn<[string], Observable<Story>>();

	function resolve(slug: string): Observable<Story> {
		const route = { paramMap: convertToParamMap({ slug }) } as ActivatedRouteSnapshot;
		return TestBed.runInInjectionContext(() => storyResolver(route, {} as RouterStateSnapshot)) as Observable<Story>;
	}

	beforeEach(() => {
		clearAllMocks();
		getBySlug.mockReturnValue(returnedObservable);
		TestBed.configureTestingModule({
			providers: [{ provide: StoryApi, useValue: { getBySlug } }],
		});
	});

	it('should call getBySlug with the slug from the route', () => {
		resolve('el-aleph');

		expect(getBySlug).toHaveBeenCalledWith('el-aleph');
	});

	it('should return the api observable without wrapping it in a promise', () => {
		const result = resolve('el-aleph');

		expect(result).toBe(returnedObservable);
	});

	it('should fall back to an empty slug when the route has none', () => {
		const route = { paramMap: convertToParamMap({}) } as ActivatedRouteSnapshot;

		TestBed.runInInjectionContext(() => storyResolver(route, {} as RouterStateSnapshot));

		expect(getBySlug).toHaveBeenCalledWith('');
	});
});

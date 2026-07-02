import { clearAllMocks, fn } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { of, type Observable } from 'rxjs';

import { type LandingPageContent } from '@models/landing-page-content.model';
import { ContentApi } from '../../providers/content-api.interface';
import { homeContentResolver } from './home-content.resolver';

describe('homeContentResolver', () => {
	const landingPageContent: LandingPageContent = {
		_id: '',
		config: '',
		cards: [],
		campaigns: [],
		mostRead: [],
		latestReads: [],
	};
	const returnedObservable: Observable<LandingPageContent> = of(landingPageContent);
	const getLandingPageContent = fn<[], Observable<LandingPageContent>>();

	function resolve(): Observable<LandingPageContent> {
		return TestBed.runInInjectionContext(() =>
			homeContentResolver({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
		) as Observable<LandingPageContent>;
	}

	beforeEach(() => {
		clearAllMocks();
		getLandingPageContent.mockReturnValue(returnedObservable);
		TestBed.configureTestingModule({
			providers: [{ provide: ContentApi, useValue: { getLandingPageContent } }],
		});
	});

	it('should call getLandingPageContent', () => {
		resolve();

		expect(getLandingPageContent).toHaveBeenCalledTimes(1);
	});

	it('should return the api observable without wrapping it in a promise', () => {
		const result = resolve();

		expect(result).toBe(returnedObservable);
	});
});

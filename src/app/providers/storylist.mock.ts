// Core
import type { EnvironmentProviders } from '@angular/core';
import { makeEnvironmentProviders } from '@angular/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

// Models
import type { Storylist } from '@models/storylist.model';
import { storylistMock } from '@mocks/storylist.mock';
import { StorylistApi } from './storylist.provider';

export class StubStorylistApi implements StorylistApi {
	public get(): Observable<Storylist> {
		return of(storylistMock);
	}
}

export function provideStorylistApiMock(api: StorylistApi = new StubStorylistApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: StorylistApi, useValue: api }]);
}

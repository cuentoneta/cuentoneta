// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import type { LiteraryWork } from '@models/literary-work.model';
import { literaryWorkMock } from '@mocks/literary-work.mock';
import { LiteraryWorkApi } from './literary-work-api.interface';

export class StubLiteraryWorkApi implements LiteraryWorkApi {
	public getBySlug(): Observable<LiteraryWork> {
		return of(literaryWorkMock);
	}
}

export function provideLiteraryWorkApiMock(api: LiteraryWorkApi = new StubLiteraryWorkApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LiteraryWorkApi, useValue: api }]);
}

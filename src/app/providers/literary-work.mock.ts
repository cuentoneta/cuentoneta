// Core
import type { EnvironmentProviders } from '@angular/core';
import { makeEnvironmentProviders } from '@angular/core';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';

// Models
import type { LiteraryWork } from '@models/literary-work.model';
import { LiteraryWorkApi } from './literary-work.provider';

export class StubLiteraryWorkApi implements LiteraryWorkApi {
	constructor(private readonly literaryWork: LiteraryWork) {}

	public getBySlug(): Observable<LiteraryWork> {
		return of(this.literaryWork);
	}
}

export function provideLiteraryWorkApiMock(api: LiteraryWorkApi): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LiteraryWorkApi, useValue: api }]);
}

// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import type { LiteraryWork } from '@models/literary-work.model';
import { LiteraryWorkApi } from './literary-work-api.interface';

export class StubLiteraryWorkApi implements LiteraryWorkApi {
	// El test provee la obra del canon de Onoff a ejercitar; sin default, para no acoplar el doble
	// a una obra concreta ni hand-authorear un objeto paralelo.
	constructor(private readonly literaryWork: LiteraryWork) {}

	public getBySlug(): Observable<LiteraryWork> {
		return of(this.literaryWork);
	}
}

export function provideLiteraryWorkApiMock(api: LiteraryWorkApi): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LiteraryWorkApi, useValue: api }]);
}

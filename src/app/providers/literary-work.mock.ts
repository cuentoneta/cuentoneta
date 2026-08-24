// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import { LiteraryWorkApi } from './literary-work.provider';

export class StubLiteraryWorkApi implements LiteraryWorkApi {
	constructor(
		private readonly literaryWork: LiteraryWork,
		// Teasers canned para las sugerencias de lectura; vacío por defecto, porque los specs que no
		// montan la tríada no tienen por qué declararlos.
		private readonly authorTeasers: LiteraryWorkTeaser[] = [],
	) {}

	public getBySlug(): Observable<LiteraryWork> {
		return of(this.literaryWork);
	}

	public getByAuthorSlug(): Observable<LiteraryWorkTeaser[]> {
		return of(this.authorTeasers);
	}
}

export function provideLiteraryWorkApiMock(api: LiteraryWorkApi): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LiteraryWorkApi, useValue: api }]);
}

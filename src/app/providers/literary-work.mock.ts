// Core
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

// Models
import type { LiteraryWork } from '@models/literary-work.model';
import { elOdioLiteraryWorkMock } from '@mocks/onoff/el-odio.mock';
import { LiteraryWorkApi } from './literary-work-api.interface';

export class StubLiteraryWorkApi implements LiteraryWorkApi {
	// Seam de construcción: un test puede alimentar la obra del canon que quiere ejercitar,
	// sin hand-authorear un objeto paralelo. Default el-odio → compatible con los consumidores previos.
	constructor(private readonly literaryWork: LiteraryWork = elOdioLiteraryWorkMock) {}

	public getBySlug(): Observable<LiteraryWork> {
		return of(this.literaryWork);
	}
}

export function provideLiteraryWorkApiMock(api: LiteraryWorkApi = new StubLiteraryWorkApi()): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: LiteraryWorkApi, useValue: api }]);
}

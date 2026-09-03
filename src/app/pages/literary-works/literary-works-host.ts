import { InjectionToken, type Signal } from '@angular/core';

import { type LiteraryWorkTeaser } from '@models/literary-work.model';

export interface LiteraryWorksHost {
	readonly literaryWorks: Signal<readonly LiteraryWorkTeaser[]>;
}

export const LITERARY_WORKS_HOST = new InjectionToken<LiteraryWorksHost>('LITERARY_WORKS_HOST');

import { InjectionToken, type Signal } from '@angular/core';

import { type LiteraryWork } from '@models/literary-work.model';

export interface LiteraryWorkHost {
	readonly literaryWork: Signal<LiteraryWork | undefined>;
}

export const LITERARY_WORK_HOST = new InjectionToken<LiteraryWorkHost>('LITERARY_WORK_HOST');

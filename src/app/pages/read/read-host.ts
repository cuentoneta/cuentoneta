import { InjectionToken, type Signal } from '@angular/core';

import { type LiteraryWork } from '@models/literary-work.model';

export interface ReadHost {
	readonly literaryWork: Signal<LiteraryWork | undefined>;
}

export const READ_HOST = new InjectionToken<ReadHost>('READ_HOST');

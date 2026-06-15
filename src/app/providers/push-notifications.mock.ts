import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PushNotificationsApi } from './push-notifications.interface';

export class InMemoryPushNotificationsApi implements PushNotificationsApi {
	public getAppId(): Observable<string> {
		return of('');
	}
}

export function providePushNotificationsApiMock(
	api: PushNotificationsApi = new InMemoryPushNotificationsApi(),
): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: PushNotificationsApi, useValue: api }]);
}

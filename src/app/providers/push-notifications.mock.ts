import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PushNotificationsApi } from './push-notifications-api.interface';

export class StubPushNotificationsApi implements PushNotificationsApi {
	public getAppId(): Observable<string> {
		return of('');
	}
}

export function providePushNotificationsApiMock(
	api: PushNotificationsApi = new StubPushNotificationsApi(),
): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: PushNotificationsApi, useValue: api }]);
}

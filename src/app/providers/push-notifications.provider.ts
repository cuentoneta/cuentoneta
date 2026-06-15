import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PushNotificationsApi } from './push-notifications.interface';

@Injectable({ providedIn: 'root' })
export class HttpPushNotificationsApi implements PushNotificationsApi {
	private readonly http = inject(HttpClient);

	public getAppId(): Observable<string> {
		return this.http.get<string>(`/api/push-notifications/get-app-id`);
	}
}

export function providePushNotificationsApi(): EnvironmentProviders {
	return makeEnvironmentProviders([{ provide: PushNotificationsApi, useExisting: HttpPushNotificationsApi }]);
}

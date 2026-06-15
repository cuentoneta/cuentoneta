import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface PushNotificationsApi {
	getAppId(): Observable<string>;
}

export const PushNotificationsApi = new InjectionToken<PushNotificationsApi>('PushNotificationsApi');

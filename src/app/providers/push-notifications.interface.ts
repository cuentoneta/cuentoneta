import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

// Rediseñado en #1499: la versión previa (servicio stateful con `appId` + `assignAppId()` async que
// usaba `.toPromise()`) se reemplaza por una lectura reactiva. Sin consumidores al momento del cambio.
export interface PushNotificationsApi {
	getAppId(): Observable<string>;
}

export const PushNotificationsApi = new InjectionToken<PushNotificationsApi>('PushNotificationsApi');

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PushNotificationsService {
	public appId: string = '';

	constructor(private http: HttpClient) {}

	public async assignAppId() {
		this.appId = (await this.http.get<string>(`/api/push-notifications/get-app-id`).toPromise()) ?? '';
	}
}

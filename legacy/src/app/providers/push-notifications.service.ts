import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushNotificationsService {
    public appId: string;

    constructor(private http: HttpClient) {}

    public async assignAppId() {
        this.appId = await this.http.get<string>(`${environment.apiUrl}/api/push-notifications/get-app-id`).toPromise();
    }
}

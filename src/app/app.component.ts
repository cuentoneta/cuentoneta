import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { MenuController, Platform } from '@ionic/angular';

import { SettingsService } from './providers/settings.service';

import { OneSignal } from 'onesignal-ngx';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
    public appPages = [
        {
            title: 'Cuento del Día',
            url: '/story',
            icon: 'book',
        },
        {
            title: 'Lista de Cuentos',
            url: '/list',
            icon: 'calendar',
        },
    ];

    public settingsPages = [
        {
            title: 'Acerca de...',
            url: '/about',
            icon: 'information-circle',
        },
        {
            title: 'Suscripción',
            url: '/subscription',
            icon: 'notifications',
        },
        {
            title: 'DMCA',
            url: '/dmca',
            icon: 'document-lock',
        },
    ];

    public externalLinks = [
        {
            title: 'Canal de Telegram',
            url: 'https://t.me/LaCuentoneta',
            icon: 'paper-plane',
        },
    ];

    public darkMode = false;

    constructor(
        private menu: MenuController,
        private oneSignal: OneSignal,
        private platform: Platform,
        private router: Router,
        private settingsService: SettingsService
    ) {
        this.initializeApp();
    }

    public initializeApp() {
        this.platform.ready().then(async () => {
            this.settingsService.darkMode$.subscribe((value) => (this.darkMode = value));
        });
    }

    public async onModeChange(event: CustomEvent) {
        this.settingsService.setDarkModeSettings(event.detail.checked);
    }
}

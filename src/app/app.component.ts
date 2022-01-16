import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { MenuController, Platform } from '@ionic/angular';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SettingsService } from './providers/settings.service';

import { OneSignalService } from 'onesignal-ngx';

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
        private platform: Platform,
        private router: Router,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private settingsService: SettingsService,
        private oneSignal: OneSignalService
    ) {
        this.initializeApp();
        this.oneSignal.init({
            appId: '8f97e6b0-5139-4391-ac63-f752358de3b3',
            promptOptions: {
                slidedown: {
                    prompts: [
                        {
                            type: 'push', // current types are "push" & "category"
                            autoPrompt: true,
                            text: {
                                /* limited to 90 characters */
                                actionMessage: "We'd like to show you notifications for the latest news and updates.",
                                /* acceptButton limited to 15 characters */
                                acceptButton: 'Allow',
                                /* cancelButton limited to 15 characters */
                                cancelButton: 'Cancel',
                            },
                            delay: {
                                pageViews: 1,
                                timeDelay: 20,
                            },
                        },
                    ],
                },
            },
        });
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            this.settingsService.darkMode$.subscribe((value) => (this.darkMode = value));
        });
    }

    public async onModeChange(event: CustomEvent) {
        this.settingsService.setDarkModeSettings(event.detail.checked);
    }

    public subscribeAlert() {
        this.oneSignal.showSlidedownPrompt();
    }
}

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { OneSignal } from 'onesignal-ngx';

@Component({
    selector: 'page-subscription',
    templateUrl: 'subscription.html',
    styleUrls: ['./subscription.scss'],
})
export class SubscriptionPage implements OnInit, AfterViewInit {
    public isSubscriptionActive: boolean = false;
    public subscriptionStatusLoaded: boolean = false;

    constructor(public oneSignalService: OneSignal, public toastController: ToastController) {}

    async ngOnInit() {
        this.subscriptionStatusLoaded = true;
    }

    async ngAfterViewInit() {
        this.checkNotificationStatus();
    }

    public async enableSubscription() {
        if (!this.isSubscriptionActive) {
            await this.oneSignalService.showSlidedownPrompt();
            await this.oneSignalService.setSubscription(true);
            await this.checkNotificationStatus();
        }
    }

    public async disableSubscription() {
        if (this.isSubscriptionActive) {
            await this.oneSignalService.setSubscription(false);
            await this.checkNotificationStatus();
            this.presentToast('Te desuscribiste exitosamente de las actualizaciones de La Cuentoneta.');
        }
    }

    async presentToast(message: string) {
        const toast = await this.toastController.create({
            message: message,
            duration: 2000,
        });
        toast.present();
    }

    private async checkNotificationStatus() {
        this.isSubscriptionActive = await this.oneSignalService.isPushNotificationsEnabled();
    }
}

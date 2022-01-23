import { Component, OnDestroy, OnInit } from '@angular/core';
import { OneSignalService } from 'onesignal-ngx';
import { ToastController } from '@ionic/angular';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'page-subscription',
    templateUrl: 'subscription.html',
    styleUrls: ['./subscription.scss'],
})
export class SubscriptionPage implements OnInit, OnDestroy {
    public isSubscriptionActive: boolean = false;
    public subscriptionStatusLoaded: boolean = false;

    private subscriptionStatusSubscription: Subscription;

    constructor(public oneSignalService: OneSignalService, public toastController: ToastController) {}

    async ngOnInit() {
        this.subscriptionStatusLoaded = true;

        this.subscriptionStatusSubscription = interval(1000).subscribe(async () => {
            const value = await this.oneSignalService.isPushNotificationsEnabled();
            this.isSubscriptionActive = value;
        });
    }

    ngOnDestroy() {
        this.subscriptionStatusSubscription.unsubscribe();
    }

    public async enableSubscription() {
        if (!this.isSubscriptionActive) {
            await this.oneSignalService.showSlidedownPrompt();
            await this.oneSignalService.setSubscription(true);
        }
    }

    public async disableSubscription() {
        if (this.isSubscriptionActive) {
            await this.oneSignalService.setSubscription(false);
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
}

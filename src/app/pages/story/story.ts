import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Config, IonRouterOutlet, LoadingController, ToastController } from '@ionic/angular';
import { StoryService } from '../../providers/story.service';
import { StoryModel } from '../../models/story.model';

@Component({
    selector: 'page-story',
    templateUrl: 'story.html',
    styleUrls: ['./story.scss'],
})
export class StoryPage implements OnInit {
    public currentStoryId = 1;
    public story: StoryModel;
    public showBackButton: boolean = true;
    public showForwardButton: boolean = true;
    public progress: string = '0%';

    constructor(
        public loadingCtrl: LoadingController,
        private route: ActivatedRoute,
        public router: Router,
        public routerOutlet: IonRouterOutlet,
        public toastCtrl: ToastController,
        public config: Config,
        public storyService: StoryService
    ) {}

    ngOnInit() {
        this.route.data.subscribe((result) => {
            this.story = result.story;
            this.handleBackButtonVisibility();
            this.handleForwardButtonVisibility();
        });
    }

    public navigateBack() {
        this.router.navigate([`/story/${this.story.id - 1}`]);
    }

    public navigateForward() {
        this.router.navigate([`/story/${this.story.id + 1}`]);
    }

    public async onScroll(event) {
        const elem = document.getElementById('ion-text-content');

        // the ion content has its own associated scrollElement
        const scrollElement = await (elem as any).getScrollElement();

        const scrollPosition = event.detail.scrollTop;
        const totalContentHeight = scrollElement.scrollHeight;
        const viewportHeight = 60 + elem.offsetHeight;

        const percentage = scrollPosition / (totalContentHeight - viewportHeight);

        this.progress = percentage + '%';
    }

    // TODO: Implementar FAB para compartir
    // async openSocial(network: string, fab: HTMLIonFabElement) {
    //     const loading = await this.loadingCtrl.create({
    //         message: `Posting to ${network}`,
    //         duration: Math.random() * 1000 + 500,
    //     });
    //     await loading.present();
    //     await loading.onWillDismiss();
    //     fab.close();
    // }

    public openBio(bioUrl: string) {
        window.open(bioUrl, '_blank');
    }

    private handleBackButtonVisibility() {
        this.showBackButton = this.story.id !== 1;
    }
    private handleForwardButtonVisibility() {
        this.showForwardButton = this.story.id !== this.storyService.getCount();
    }
}

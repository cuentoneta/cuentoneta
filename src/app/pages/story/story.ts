import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Config, IonContent, IonRouterOutlet, LoadingController, ToastController } from '@ionic/angular';
import { StoryService } from '../../providers/story.service';
import { StoryModel } from '../../models/story.model';

@Component({
    selector: 'page-story',
    templateUrl: 'story.html',
    styleUrls: ['./story.scss'],
})
export class StoryPage implements OnInit, AfterViewInit {
    @ViewChild('content') content: IonContent;

    public currentStoryId = 1;
    public story: StoryModel;
    public showBackButton: boolean = true;
    public showForwardButton: boolean = true;
    public progress: string = '0%';
    public approximateReadingTime: number = 0;
    public displayStory = false;

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
            // TODO: #60 Cambiar por parsing vía librerías de Sanity
            this.story.prologues = result.story.prologues;
            this.story.paragraphs = result.story.paragraphs.map((x) => this.storyService.parseParagraph(x));
            this.story.summary = result.story.summary.map((x) => this.storyService.parseSummary(x)).pop();
            this.handleBackButtonVisibility();
            this.handleForwardButtonVisibility();
            this.calculateApproximateReadingTime();
            this.displayStory = true;
        });
    }

    ngAfterViewInit() {
        this.resetScroll();
    }

    private resetScroll() {
        this.content.scrollToTop();
        this.progress = '0%';
    }

    public navigateBack() {
        this.router.navigate([`/story/${this.story.day - 1}`]).then((result) => {
            this.resetScroll();
        });
    }

    public navigateForward() {
        this.router.navigate([`/story/${this.story.day + 1}`]).then((result) => {
            this.resetScroll();
        });
    }

    public calculateApproximateReadingTime() {
        const accumulator = (previous, current) => previous + current;
        const wordCount = this.story.paragraphs
            .map((paragraph) => paragraph.text.split(' ').length)
            .reduce(accumulator);
        this.approximateReadingTime = Math.ceil(wordCount / 200);
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

    async openSocial(network: string, fab: HTMLIonFabElement) {
        const loading = await this.loadingCtrl.create({
            message: `Compartiendo en ${network}`,
            duration: Math.random() * 1000 + 500,
        });
        await loading.present();
        await loading.onWillDismiss();

        if (network === 'Facebook') {
            window.open(
                'https://www.facebook.com/share.php?u=' +
                    encodeURIComponent(`https://cuentosdeverano.ar`) +
                    '&quote=¡Hola! Te invito a sumarte a la lectura colectiva %23CuentosDeVerano. Por cada día del verano 2022, compartimos la lectura de un cuento, historia o relato breve. %0a%0aIngresá desde este link:',
                'facebook-share-dialog',
                'width=626,height=436'
            );
            return false;
        }
        if (network === 'Whatsapp') {
            window.open(
                'whatsapp://send?text=¡Hola! Te invito a sumarte a la lectura colectiva %23CuentosDeVerano. Por cada día del verano 2022, compartimos la lectura de un cuento, historia o relato breve. %0a%0aIngresá desde: https%3A%2F%2Fcuentosdeverano.ar',
                '_blank'
            );
        }
        if (network === 'Twitter') {
            window.open(
                'https://twitter.com/intent/tweet?&text=¡Hola! Te invito a sumarte a la lectura colectiva %23CuentosDeVerano. Por cada día del verano 2022, compartimos la lectura de un cuento, historia o relato breve. %0a%0aIngresá desde: https%3A%2F%2Fcuentosdeverano.ar'
            );
        }

        fab.close();
    }

    public openBio(bioUrl: string) {
        window.open(bioUrl, '_blank');
    }

    private handleBackButtonVisibility() {
        this.showBackButton = this.story.day !== 1;
    }
    private handleForwardButtonVisibility() {
        this.showForwardButton = this.story.day !== this.storyService.count;
    }
}

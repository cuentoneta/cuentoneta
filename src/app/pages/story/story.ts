import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Config, IonContent, IonRouterOutlet, LoadingController, ToastController } from '@ionic/angular';
import { StoryService } from '../../providers/story.service';
import { StoryModel } from '../../models/story.model';
import { map, switchMap, tap } from 'rxjs/operators';
import { Observable, of, Subscription } from 'rxjs';

@Component({
    selector: 'page-story',
    templateUrl: 'story.html',
    styleUrls: ['./story.scss'],
})
export class StoryPage implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('content') content: IonContent;

    public story: StoryModel;
    public showBackButton: boolean = true;
    public showForwardButton: boolean = true;
    public progress: string = '0%';
    public approximateReadingTime: number = 0;
    public displayStory = false;

    private storySubscription: Subscription;

    constructor(
        public loadingCtrl: LoadingController,
        private route: ActivatedRoute,
        public router: Router,
        public config: Config,
        public storyService: StoryService
    ) {}

    ngOnInit() {
        this.load();
    }

    ngOnDestroy(): void {
        this.storySubscription.unsubscribe();
    }

    private load() {
        this.storySubscription = this.route.params
            .pipe(
                tap(() => {
                    this.displayStory = false;
                }),
                switchMap(({ day, edition }) => {
                    return this.storyService.getCount(edition ?? 2022).pipe(
                        switchMap((count) => {
                            // Asigna cantidad de cuentos de la edición correspondiente
                            this.storyService.count = count;
                            return day && edition ? this.storyService.get(day, edition) : this.storyService.latest();
                        })
                    );
                }),
                map((story) => this.storyService.load(story)),
                tap((story) => {
                    this.handleBackButtonVisibility(story);
                    this.handleForwardButtonVisibility(story);
                    this.calculateApproximateReadingTime(story);
                    this.displayStory = true;
                })
            )
            .subscribe((result) => {
                this.story = result;
            });
    }

    ngAfterViewInit() {
        this.resetScroll();
    }

    private resetScroll() {
        this.content.scrollToTop();
        this.progress = '0%';
    }

    public navigateBack(story) {
        this.router.navigate([`/story/${story.day - 1}`]).then((result) => {
            this.resetScroll();
        });
    }

    public navigateForward(story) {
        this.router.navigate([`/story/${story.day + 1}`]).then((result) => {
            this.resetScroll();
        });
    }

    public calculateApproximateReadingTime(story) {
        const accumulator = (previous, current) => previous + current;
        const wordCount = story.paragraphs.map((paragraph) => paragraph.split(' ').length).reduce(accumulator);
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

    private handleBackButtonVisibility(story: StoryModel) {
        this.showBackButton = story.day !== 1;
    }
    private handleForwardButtonVisibility(story: StoryModel) {
        this.showForwardButton = story.day !== this.storyService.count;
    }
}

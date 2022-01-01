import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
  Config,
  IonRouterOutlet,
  LoadingController,
  ToastController,
} from "@ionic/angular";
import { StoryService } from "../../providers/story.service";
import { StoryModel } from "../../models/story.model";

@Component({
  selector: "page-story",
  templateUrl: "story.html",
  styleUrls: ["./story.scss"],
})
export class StoryPage implements OnInit {
  public currentStoryId = 1;
  public story: StoryModel;
  public showBackButton: boolean = true;
  public showForwardButton: boolean = true;
  public progress: string = "0%";

  constructor(
    public loadingCtrl: LoadingController,
    public router: Router,
    public routerOutlet: IonRouterOutlet,
    public toastCtrl: ToastController,
    public config: Config,
    public storyService: StoryService
  ) {}

  ngOnInit() {
    this.storyService.get(1).subscribe((result) => {
      this.story = result;
    });
  }

  public navigateBack() {}

  public navigateForward() {}

  public async doSomething(event) {
    const elem = document.getElementById("ion-text-content");

    // the ion content has its own associated scrollElement
    const scrollElement = await (elem as any).getScrollElement();

    const scrollPosition = event.detail.scrollTop;
    const totalContentHeight = scrollElement.scrollHeight;
    const viewportHeight = 60 + elem.offsetHeight;

    const percentage = scrollPosition / (totalContentHeight - viewportHeight);

    this.progress = percentage + "%";
  }

  async openSocial(network: string, fab: HTMLIonFabElement) {
    const loading = await this.loadingCtrl.create({
      message: `Posting to ${network}`,
      duration: Math.random() * 1000 + 500,
    });
    await loading.present();
    await loading.onWillDismiss();
    fab.close();
  }
}

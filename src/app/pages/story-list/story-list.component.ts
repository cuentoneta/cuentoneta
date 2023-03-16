import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoryService } from '../../providers/story.service';
import { Subscription, switchMap, take, tap } from 'rxjs';
import { StoryList } from '../../models/storylist.model';

@Component({
    selector: 'cuentoneta-story-list',
    templateUrl: './story-list.component.html',
    styleUrls: ['./story-list.component.scss'],
})
export class StoryListComponent implements OnDestroy {
    storyList: StoryList | undefined;
    private subscription: Subscription;
    constructor(private activatedRoute: ActivatedRoute, private storyService: StoryService) {
        this.subscription = activatedRoute.queryParams
            .pipe(
                // ToDo: Rediseñar signature del método para poder traer todas las historias y luego hacer fetch vía scroll/ver más
                switchMap(({ slug }) => {
                    this.storyList = undefined;
                    return this.storyService.getLatest(slug, 60);
                })
            )
            .subscribe((storyList) => {
                this.storyList = storyList;
            });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}

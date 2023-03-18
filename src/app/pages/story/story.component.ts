import { Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Subscription, switchMap, takeUntil } from 'rxjs';
import { StoryService } from '../../providers/story.service';
import { Story } from '../../models/story.model';
import { StoryList } from '../../models/storylist.model';
import { DestroyedDirective } from '../../directives/destroyed.directive';

@Component({
    selector: 'cuentoneta-story',
    templateUrl: './story.component.html',
    styleUrls: ['./story.component.scss'],
    hostDirectives: [DestroyedDirective],
})
export class StoryComponent {
    story: Story | undefined;
    storylist: StoryList | undefined;

    dummyList = Array(10);

    constructor() {
        const activatedRoute = inject(ActivatedRoute);
        const destroyedDirective = inject(DestroyedDirective);
        const storyService = inject(StoryService);

        combineLatest([
            activatedRoute.queryParams.pipe(
                switchMap(({ slug }) => {
                    this.story = undefined;
                    return storyService.getBySlug(slug);
                })
            ),
            activatedRoute.queryParams.pipe(switchMap(({ list }) => storyService.getLatest(list, 10))),
        ])
            .pipe(takeUntil(destroyedDirective.destroyed$))
            .subscribe(([story, storylist]) => {
                this.story = story;
                this.storylist = storylist;
            });
    }
}

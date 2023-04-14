// Core
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, switchMap, takeUntil } from 'rxjs';

// Models
import { Story } from '../../models/story.model';
import { StoryList } from '../../models/storylist.model';

// Services
import { StoryService } from '../../providers/story.service';

// Directives
import { DestroyedDirective } from '../../directives/destroyed.directive';
import { FetchContentDirective } from '../../directives/fetch-content.directive';

@Component({
    selector: 'cuentoneta-story',
    templateUrl: './story.component.html',
    styleUrls: ['./story.component.scss'],
    hostDirectives: [DestroyedDirective, FetchContentDirective],
})
export class StoryComponent {
    fetchContentDirective = inject(FetchContentDirective<[Story, StoryList]>);

    story!: Story;
    storylist!: StoryList;

    dummyList = Array(10);

    constructor() {
        const activatedRoute = inject(ActivatedRoute);
        const destroyedDirective = inject(DestroyedDirective);
        const storyService = inject(StoryService);

        this.fetchContentDirective
            .fetchContentWithSourceParams$(
                activatedRoute.queryParams,
                switchMap(({ slug, list }) =>
                    combineLatest([storyService.getBySlug(slug), storyService.getLatest(list, 10)])
                )
            )
            .pipe(takeUntil(destroyedDirective.destroyed$))
            .subscribe(([story, storylist]) => {
                this.story = story;
                this.storylist = storylist;
            });
    }
}

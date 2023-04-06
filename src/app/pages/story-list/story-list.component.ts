// Core
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { pipe, switchMap, takeUntil } from 'rxjs';

// Models
import { StoryList } from '../../models/storylist.model';

// Services
import { StoryService } from '../../providers/story.service';

// Directives
import { DestroyedDirective } from '../../directives/destroyed.directive';
import { FetchContentDirective } from '../../directives/fetch-content.directive';

@Component({
    selector: 'cuentoneta-story-list',
    templateUrl: './story-list.component.html',
    styleUrls: ['./story-list.component.scss'],
    hostDirectives: [DestroyedDirective, FetchContentDirective],
})
export class StoryListComponent {
    fetchContentDirective = inject(FetchContentDirective<StoryList>);
    storyList!: StoryList | undefined;

    constructor() {
        const activatedRoute = inject(ActivatedRoute);
        const destroyedDirective = inject(DestroyedDirective);
        const storyService = inject(StoryService);

        this.fetchContentDirective
            .fetchContentWithSourceParams$(
                activatedRoute.queryParams,
                pipe(
                    switchMap(({ slug }) => {
                        return storyService.getLatest(slug, 60);
                    }),
                    takeUntil(destroyedDirective.destroyed$)
                )
            )
            .subscribe((storyList) => {
                this.storyList = storyList;
            });
    }
}

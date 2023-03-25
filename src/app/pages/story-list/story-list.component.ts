import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoryService } from '../../providers/story.service';
import { switchMap, takeUntil } from 'rxjs';
import { StoryList } from '../../models/storylist.model';
import { DestroyedDirective } from '../../directives/destroyed.directive';

@Component({
    selector: 'cuentoneta-story-list',
    templateUrl: './story-list.component.html',
    styleUrls: ['./story-list.component.scss'],
    hostDirectives: [DestroyedDirective],
})
export class StoryListComponent {
    storyList!: StoryList;

    constructor() {
        const activatedRoute = inject(ActivatedRoute);
        const destroyedDirective = inject(DestroyedDirective);
        const storyService = inject(StoryService);

        activatedRoute.queryParams
            .pipe(
                // ToDo: Rediseñar signature del método para poder traer todas las historias y luego hacer fetch vía scroll/ver más
                switchMap(({ slug }) => {
                    return storyService.getLatest(slug, 60);
                }),
                takeUntil(destroyedDirective.destroyed$)
            )
            .subscribe((storyList) => {
                this.storyList = storyList;
            });
    }
}

// Core
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, takeUntil } from 'rxjs';
import { Meta, Title } from '@angular/platform-browser';

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
        const metaTagService = inject(Meta);
        const titleService = inject(Title);

        this.fetchContentDirective
            .fetchContentWithSourceParams$(
                activatedRoute.queryParams,
                switchMap(({ slug }) => {
                    return storyService.getLatest(slug, 60);
                })
            )
            .pipe(takeUntil(destroyedDirective.destroyed$))
            .subscribe((storylist) => {
                this.storyList = storylist;
                titleService.setTitle(
                    `${storylist.title} - La Cuentoneta`
                );
                metaTagService.updateTag({
                    name: 'twitter:title',
                    content: `"${storylist.title} en La Cuentoneta"`,
                });
                metaTagService.updateTag({
                    name: 'twitter:description',
                    content: `Colección "${storylist.title}", una storylist en La Cuentoneta`,
                });
                metaTagService.updateTag({
                    property: 'og:title',
                    content: `"${storylist.title} en La Cuentoneta"`,
                });
                metaTagService.updateTag({
                    property: 'og:description',
                    content: `Colección "${storylist.title}", una storylist en La Cuentoneta`,
                });
            });
    }
}

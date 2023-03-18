import { Component, inject } from '@angular/core';
import { StoryService } from '../../providers/story.service';
import { combineLatest, takeUntil } from 'rxjs';
import { StoryList } from '../../models/storylist.model';
import { DestroyedDirective } from '../../directives/destroyed.directive';

@Component({
    selector: 'cuentoneta-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    hostDirectives: [DestroyedDirective],
})
export class HomeComponent {
    latestStories: StoryList | undefined;
    oldStories: StoryList | undefined;

    constructor() {
        const destroyedDirective = inject(DestroyedDirective);
        const storyService = inject(StoryService);

        combineLatest([storyService.getLatest('fec-english-sessions', 5), storyService.getLatest('verano-2022', 6)])
            .pipe(takeUntil(destroyedDirective.destroyed$))
            .subscribe(([topStories, oldStories]) => {
                this.latestStories = topStories;
                this.oldStories = oldStories;
            });
    }
}

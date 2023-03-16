import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoryService } from '../../providers/story.service';
import { switchMap, take } from 'rxjs';
import { StoryList } from '../../models/storylist.model';

@Component({
    selector: 'cuentoneta-story-list',
    templateUrl: './story-list.component.html',
    styleUrls: ['./story-list.component.scss'],
})
export class StoryListComponent {
    storyList: StoryList | undefined;
    constructor(private activatedRoute: ActivatedRoute, private storyService: StoryService) {
        activatedRoute.queryParams
            .pipe(
                // ToDo: Rediseñar signature del método para poder traer todas las historias y luego hacer fetch vía scroll/ver más
                switchMap(({ slug }) => this.storyService.getLatest(slug, 60)),
                take(1)
            )
            .subscribe((storyList) => {
                this.storyList = storyList;
            });
    }
}

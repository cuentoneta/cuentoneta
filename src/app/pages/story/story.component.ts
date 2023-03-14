import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { StoryService } from '../../providers/story.service';
import { Story } from '../../models/story.model';
import { StoryList } from '../../models/storylist.model';

@Component({
    selector: 'cuentoneta-story',
    templateUrl: './story.component.html',
    styleUrls: ['./story.component.scss'],
})
export class StoryComponent {
    story$: Observable<Story> | undefined;
    storylist$: Observable<StoryList> | undefined;
    constructor(private activatedRoute: ActivatedRoute, private storyService: StoryService) {
        this.story$ = activatedRoute.queryParams.pipe(switchMap(({ id }) => this.storyService.getById(id)));
        this.storylist$ = activatedRoute.queryParams.pipe(
            switchMap(({ list }) => this.storyService.getLatest(list, 10))
        );
    }
}

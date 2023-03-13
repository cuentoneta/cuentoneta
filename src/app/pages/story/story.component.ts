import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { StoryService } from '../../providers/story.service';
import { Story, StoryList } from '../../models/story.model';

@Component({
    selector: 'cuentoneta-story',
    templateUrl: './story.component.html',
    styleUrls: ['./story.component.scss'],
})
export class StoryComponent {
    story$: Observable<Story> | undefined;
    storyList$: Observable<StoryList> | undefined;
    constructor(private activatedRoute: ActivatedRoute, private storyService: StoryService) {
        this.story$ = activatedRoute.queryParams.pipe(switchMap(({ id }) => this.storyService.getById(id)));
        this.storyList$ = activatedRoute.queryParams.pipe(
            switchMap(({ list }) => combineLatest([of(list), this.storyService.getLatest(list, 10)])),
            map(([name, stories]) => ({ title: name, stories: stories }))
        );
    }
}

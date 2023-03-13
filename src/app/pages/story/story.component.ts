import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { StoryService } from '../../providers/story.service';
import { Story } from '../../models/story.model';

@Component({
    selector: 'cuentoneta-story',
    templateUrl: './story.component.html',
    styleUrls: ['./story.component.scss'],
})
export class StoryComponent {
    story$: Observable<Story> | undefined;
    storyList$: Observable<Story[]> | undefined;
    constructor(private activatedRoute: ActivatedRoute, private storyService: StoryService) {
        this.story$ = activatedRoute.queryParams.pipe(switchMap(({ id }) => this.storyService.getById(id)));
        // ToDo: Parametrizar StoryList
        this.storyList$ = activatedRoute.queryParams.pipe(switchMap(({ id }) => this.storyService.getLatest('2021', 10)));
    }
}

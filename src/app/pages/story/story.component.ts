import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, first, switchMap } from 'rxjs';
import { StoryService } from '../../providers/story.service';
import { Story } from '../../models/story.model';
import { StoryList } from '../../models/storylist.model';

@Component({
    selector: 'cuentoneta-story',
    templateUrl: './story.component.html',
    styleUrls: ['./story.component.scss'],
})
export class StoryComponent {
    story: Story | undefined;
    storylist: StoryList | undefined;

    dummyList = Array(10)
    constructor(private activatedRoute: ActivatedRoute, private storyService: StoryService) {
        combineLatest([
            activatedRoute.queryParams.pipe(switchMap(({ id }) => this.storyService.getById(id))),
            activatedRoute.queryParams.pipe(switchMap(({ list }) => this.storyService.getLatest(list, 10))),
        ])
            .pipe(first())
            .subscribe(([story, storylist]) => {
                this.story = story;
                this.storylist = storylist;
            });
    }
}

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { StoryService } from '../../providers/story.service';

@Component({
    selector: 'cuentoneta-story',
    templateUrl: './story.component.html',
    styleUrls: ['./story.component.scss'],
})
export class StoryComponent {
    constructor(private activatedRoute: ActivatedRoute, private storyService: StoryService) {
        activatedRoute.queryParams.pipe(switchMap(({ id }) => this.storyService.getById(id))).subscribe((story) => {
            console.log(story);
        });
    }
}

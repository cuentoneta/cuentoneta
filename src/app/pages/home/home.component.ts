import {Component, OnInit} from '@angular/core';
import { StoryService } from '../../providers/story.service';
import { Observable, of } from 'rxjs';
import { Story } from '../../models/story.model';

@Component({
    selector: 'cuentoneta-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

    topStoriesAmount = 5;
    storiesAmount = 6;
    $latestStories: Observable<Story[]> = of([]);
    $oldStories: Observable<Story[]> = of([]);

    constructor(private storyService: StoryService) {}

    ngOnInit(): void {
        this.$latestStories = this.storyService.getLatest('2022', this.topStoriesAmount)
        this.$oldStories = this.storyService.getLatest('2021', this.storiesAmount)
    }
}

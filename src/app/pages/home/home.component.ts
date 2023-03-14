import { Component, OnInit } from '@angular/core';
import { StoryService } from '../../providers/story.service';
import { combineLatest } from 'rxjs';
import { StoryList } from '../../models/storylist.model';

@Component({
    selector: 'cuentoneta-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    latestStories: StoryList | undefined;
    oldStories: StoryList | undefined;

    constructor(private storyService: StoryService) {}

    ngOnInit(): void {
        combineLatest([
            this.storyService.getLatest('fec-english-sessions', 5),
            this.storyService.getLatest('verano-2022', 6),
        ]).subscribe(([topStories, oldStories]) => {
            this.latestStories = topStories;
            this.oldStories = oldStories;
        });
    }
}

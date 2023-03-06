import { Component, OnInit } from '@angular/core';
import { StoryService } from '../../providers/story.service';
import { combineLatest, Observable, of } from 'rxjs';
import { Story } from '../../models/story.model';

@Component({
    selector: 'cuentoneta-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

    latestStories: Story[] = Array(5);
    oldStories: Story[] = Array(6);

    constructor(private storyService: StoryService) {}

    ngOnInit(): void {
        combineLatest([
            this.storyService.getLatest('2022', this.latestStories.length),
            this.storyService.getLatest('2021', this.oldStories.length),
        ]).subscribe(([topStories, oldStories]) => {
            this.latestStories = topStories;
            this.oldStories = oldStories;
        });
    }
}

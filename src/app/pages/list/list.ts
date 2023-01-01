import { Component, OnInit } from '@angular/core';
import { StoryService } from '../../providers/story.service';
import { StoryModel } from '../../models/story.model';
import { Router } from '@angular/router';

@Component({
    selector: 'page-list',
    templateUrl: 'list.html',
    styleUrls: ['./list.scss'],
})
export class ListPage implements OnInit {
    public storyList: StoryModel[] = [];

    constructor(private router: Router, private storyService: StoryService) {}

    ngOnInit() {
        this.storyService.getAuthors(2021).subscribe((result) => {
            this.storyList = result;
        });
    }

    public navigateToStory(day: number) {
        this.router.navigate([`/story/${day}/2021`]);
    }
}

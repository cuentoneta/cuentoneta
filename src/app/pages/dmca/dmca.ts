import { Component, OnInit } from '@angular/core';
import { StoryService } from '../../providers/story.service';
import { Author } from '../../models/story.model';

@Component({
    selector: 'page-dmca',
    templateUrl: 'dmca.html',
    styleUrls: ['./dmca.scss'],
})
export class DmcaPage implements OnInit {
    public linksList: OriginalLink[] = [];
    constructor(private storyService: StoryService) {}

    ngOnInit() {
        this.storyService.getOriginalLinks().subscribe((result) => {
            this.linksList = result;
        });
    }
}

export interface OriginalLink {
    author: Author;
    day: number;
    originalLink: string;
    title: string;
}

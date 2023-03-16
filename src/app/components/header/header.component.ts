import { Component, inject } from '@angular/core';
import { StoryService } from '../../providers/story.service';
import { StoryList } from '../../models/storylist.model';

@Component({
    selector: 'cuentoneta-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    lists: Pick<StoryList, 'title' | 'slug'>[] = [];
    constructor() {
        const storyService = inject(StoryService);
        this.lists = storyService.getNavLists();
    }
}

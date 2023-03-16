import { Component, inject } from '@angular/core';
import { StoryList } from '../../models/storylist.model';
import { StoryService } from '../../providers/story.service';

@Component({
    selector: 'cuentoneta-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
    lists: Pick<StoryList, 'title' | 'slug'>[] = [];
    constructor() {
        const storyService = inject(StoryService);
        this.lists = storyService.getNavLists();
    }
}

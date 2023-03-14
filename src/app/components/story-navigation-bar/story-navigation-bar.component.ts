import { Component, Input } from '@angular/core';
import { StoryList } from '../../models/storylist.model';

@Component({
    selector: 'cuentoneta-story-navigation-bar',
    templateUrl: './story-navigation-bar.component.html',
    styleUrls: ['./story-navigation-bar.component.scss'],
})
export class StoryNavigationBarComponent {
    @Input() storyList: StoryList = { title: '', slug: '', stories: [] };
}

import { Component, Input } from '@angular/core';
import { StoryList } from '../../models/story.model';

@Component({
    selector: 'cuentoneta-story-navigation-bar',
    templateUrl: './story-navigation-bar.component.html',
    styleUrls: ['./story-navigation-bar.component.scss'],
})
export class StoryNavigationBarComponent {
    @Input() storyList: StoryList = { title: '', stories: [] };
}

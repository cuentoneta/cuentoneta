import { Component, Input, OnInit } from '@angular/core';
import { Story } from '../../models/story.model';

@Component({
    selector: 'cuentoneta-story-card',
    templateUrl: './story-card.component.html',
    styleUrls: ['./story-card.component.scss'],
})
export class StoryCardComponent implements OnInit {
    @Input() editionPrefix: string | undefined;
    @Input() editionSuffix: string | undefined;
    @Input() displayDate: boolean = false;
    @Input() story: Story | undefined;

    editionLabel: string = '';

    ngOnInit() {
        this.editionLabel = this.editionPrefix + ' ' + this.story?.day + ' - ' + this.story?.publishedAt;
        this.editionLabel = `${this.editionPrefix} ${this.story?.day} ${
            this.displayDate ? ' - ' + this.story?.publishedAt : ''
        }${this.editionSuffix ? ' | ' + this.editionSuffix : ''}`;
    }
}

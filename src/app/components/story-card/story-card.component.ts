import { Component, Input, OnInit } from '@angular/core';
import { Story } from '../../models/story.model';
import { Publication } from '../../models/storylist.model';

// dayjs
require('dayjs/locale/es');
import dayjs from 'dayjs';
dayjs.locale('es');

@Component({
  selector: 'cuentoneta-story-card',
  templateUrl: './story-card.component.html',
  styleUrls: ['./story-card.component.scss'],
})
export class StoryCardComponent implements OnInit {
  @Input() editionPrefix: string | undefined;
  @Input() editionSuffix: string | undefined;
  @Input() comingNextLabel: string = '';
  @Input() displayDate: boolean = false;
  @Input() publication: Publication<Story> | undefined;
  @Input() editionIndex: number = 0;

  editionLabel: string = '';

  ngOnInit() {
    const dateFormat = dayjs(this.publication?.publishingDate).format(
      'DD [de] MMMM, YYYY'
    );

    this.editionLabel = `${this.editionPrefix} ${this.editionIndex} ${
      this.displayDate ? ' - ' + dateFormat : ''
    }${this.editionSuffix ? ' | ' + this.editionSuffix : ''}`;
    this.comingNextLabel = this.displayDate
      ? `${this.comingNextLabel} ${dateFormat}`
      : this.comingNextLabel;
  }
}

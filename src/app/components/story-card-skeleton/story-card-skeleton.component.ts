import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { StoryEditionDateLabelModule } from '../story-edition-date-label/story-edition-date-label.module';

@Component({
  selector: 'cuentoneta-story-card-skeleton',
  standalone: true,
  imports: [CommonModule, NgxSkeletonLoaderModule, StoryEditionDateLabelModule],
  templateUrl: './story-card-skeleton.component.html',
  styleUrls: ['./story-card-skeleton.component.scss'],
})
export class StoryCardSkeletonComponent {
  @Input() animation: 'progress' | 'progress-dark' | 'pulse' | 'false' | false =
    false;
  @Input() displayDate: boolean = false;
  @Input() editionLabel: string = '';
  @Input() comingNextLabel: string = 'Próximamente';
}

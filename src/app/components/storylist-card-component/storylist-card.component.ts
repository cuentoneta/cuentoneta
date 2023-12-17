import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StorylistCard } from '@models/storylist.model';
import { BadgeComponent } from '../badge/badge.component';

@Component({
  selector: 'cuentoneta-storylist-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, BadgeComponent],
  template: `
    <header>
      <img
        [ngSrc]="storylist?.images?.[0]?.url ?? ''"
        width="602"
        height="240"
      />
    </header>
    <article class="p-5">
      <section class="flex flex-col gap-4">
        <h1 class="card-title">{{ storylist?.title }}</h1>
        <p class="description">{{ storylist?.description }}</p>
        <hr />
        <footer class="flex justify-end">
          <cuentoneta-badge [label]="'Staff Picks'" />
        </footer>
      </section>
    </article>
  `,
  styleUrl: './storylist-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorylistCardComponent {
  @Input() storylist: Partial<StorylistCard> | null = null;
}

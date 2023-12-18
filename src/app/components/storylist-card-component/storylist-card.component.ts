import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StorylistCard } from '@models/storylist.model';
import { BadgeComponent } from '../badge/badge.component';
import { RouterLink } from '@angular/router';
import { APP_ROUTE_TREE } from '../../app.routes';

@Component({
  selector: 'cuentoneta-storylist-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, BadgeComponent, RouterLink],
  template: `
    <article>
      <div
          class="navigation-link"
        [routerLink]="['/' + appRouteTree['STORYLIST']]"
        [queryParams]="{ slug: storylist?.slug }"
      >
        <header>
          <img
            [ngSrc]="storylist?.images?.[0]?.url ?? ''"
            width="602"
            height="240"
          />
        </header>
        <section class="flex flex-col gap-4 pt-5 px-4">
          <h1 class="card-title">{{ storylist?.title }}</h1>
          <p class="description">{{ storylist?.description }}</p>
          <hr />
        </section>
      </div>
      <footer class="flex justify-end pt-4 px-5 pb-5">
        @if (storylist?.tags?.length > 0) { @for (tag of storylist?.tags;track
        tag.slug) {
        <cuentoneta-badge [tag]="tag" [showIcon]="true" class="ml-3"/>
        } }
      </footer>
    </article>
  `,
  styleUrl: './storylist-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorylistCardComponent {
  @Input() storylist: Partial<StorylistCard> | null = null;

  protected readonly appRouteTree = APP_ROUTE_TREE;
}

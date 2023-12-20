import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StorylistCard } from '@models/storylist.model';
import { BadgeComponent } from '../badge/badge.component';
import { RouterLink } from '@angular/router';
import { APP_ROUTE_TREE } from '../../app.routes';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  selector: 'cuentoneta-storylist-card',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    BadgeComponent,
    RouterLink,
    NgxSkeletonLoaderModule,
  ],
  template: `
    @if(!!storylist){
    <article>
      <div
        class="navigation-link"
        [routerLink]="['/' + appRouteTree['STORYLIST']]"
        [queryParams]="{ slug: storylist?.slug }"
      >
        <header>
          <img
            [ngSrc]="storylist.featuredImage ?? ''"
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
        @if (storylist.tags.length > 0) { 
          @for (tag of storylist?.tags; track tag.slug) {
            <cuentoneta-badge [tag]="tag" [showIcon]="true" class="ml-3" />
          } 
        }
      </footer>
    </article>
    } @else {
    <ng-container *ngTemplateOutlet="skeleton"></ng-container>
    }
    <ng-template #skeleton>
      <article>
        <ngx-skeleton-loader
          count="1"
          appearance="line"
          [animation]="'progress-dark'"
          [theme]="{
            height: '240px',
            'margin-bottom': 0,
            width: '100%'
          }"
        ></ngx-skeleton-loader>
        <section class="flex flex-col gap-4 pt-5 px-4">
          <ngx-skeleton-loader
            count="1"
            appearance="line"
            [theme]="{
              'background-color': '#D4D4D8',
              height: '40px',
              'margin-bottom': 0,
              width: '100%'
            }"
          ></ngx-skeleton-loader>
          <div>
            <ngx-skeleton-loader
              count="2"
              appearance="line"
              [theme]="{
                height: '16px',
                'margin-bottom': '8px',
                width: '100%'
              }"
            ></ngx-skeleton-loader>
            <ngx-skeleton-loader
              count="1"
              appearance="line"
              [theme]="{
                height: '16px',
                'margin-bottom': '8px',
                width: '80%'
              }"
            ></ngx-skeleton-loader>
          </div>
          <hr />
        </section>
        <footer class="flex justify-end pt-4 px-5 pb-5">
          <ngx-skeleton-loader
            count="1"
            appearance="line"
            [theme]="{
              'background-color': '#D4D4D8',
              height: '22px',
              'margin-bottom': 0,
              width: '80px'
            }"
          ></ngx-skeleton-loader>
          <ngx-skeleton-loader
            count="1"
            appearance="line"
            [theme]="{
              'background-color': '#D4D4D8',
              height: '22px',
              'margin-left': '16px',
              'margin-bottom': 0,
              width: '80px'
            }"
          ></ngx-skeleton-loader>
        </footer>
      </article>
    </ng-template>
  `,
  styleUrl: './storylist-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorylistCardComponent {
  @Input() storylist: StorylistCard | null = null;

  protected readonly appRouteTree = APP_ROUTE_TREE;
}

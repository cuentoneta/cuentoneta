// Core
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, switchMap, takeUntil } from 'rxjs';

// Models
import { Story } from '../../models/story.model';
import { StoryList } from '../../models/storylist.model';

// Services
import { StoryService } from '../../providers/story.service';

// Directives
import { DestroyedDirective } from '../../directives/destroyed.directive';
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { APP_ROUTE_TREE } from '../../app-routing.module';

@Component({
  selector: 'cuentoneta-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  hostDirectives: [DestroyedDirective, FetchContentDirective],
})
export class StoryComponent {
  readonly appRouteTree = APP_ROUTE_TREE;
  fetchContentDirective = inject(FetchContentDirective<[Story, StoryList]>);

  story!: Story;
  storylist!: StoryList;

  dummyList = Array(10);
  shareMessage: string = '';

  constructor() {
    const activatedRoute = inject(ActivatedRoute);
    const destroyedDirective = inject(DestroyedDirective);
    const storyService = inject(StoryService);

    this.fetchContentDirective
      .fetchContentWithSourceParams$(
        activatedRoute.queryParams,
        switchMap(({ slug, list }) =>
          combineLatest([
            storyService.getBySlug(slug),
            storyService.getLatest(list, 10),
          ])
        )
      )
      .pipe(takeUntil(destroyedDirective.destroyed$))
      .subscribe(([story, storylist]) => {
        this.story = story;
        this.storylist = storylist;
        this.shareMessage = `Leí "${story.title}" de ${story.author.name} en La Cuentoneta y te lo comparto. Sumate a leer este y otros cuentos de la colección "${storylist.title}" en este link:`;
      });
  }
}

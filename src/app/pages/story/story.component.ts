// Core
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, switchMap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Router
import { APP_ROUTE_TREE } from '../../app-routing.module';

// Models
import { Story } from '../../models/story.model';
import { StoryList } from '../../models/storylist.model';

// Services
import { MacroTaskWrapperService } from '../../providers/macro-task-wrapper.service';
import { StorylistService } from '../../storylist.service';
import { StoryService } from '../../providers/story.service';

// Directives
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

@Component({
  selector: 'cuentoneta-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  hostDirectives: [
    FetchContentDirective,
    MetaTagsDirective,
  ],
})
export class StoryComponent {
  readonly appRouteTree = APP_ROUTE_TREE;
  fetchContentDirective = inject(FetchContentDirective<[Story, StoryList]>);

  story!: Story;
  storylist!: StoryList;

  dummyList = Array(10);
  shareContentParams: { [key: string]: string } = {};
  shareMessage: string = '';

  constructor() {
    const platformId = inject(PLATFORM_ID);
    const activatedRoute = inject(ActivatedRoute);
    const metaTagsDirective = inject(MetaTagsDirective);
    const storylistService = inject(StorylistService);
    const storyService = inject(StoryService);
    const macroTaskWrapperService = inject(MacroTaskWrapperService);

    const fetchObservable$ = this.fetchContentDirective
      .fetchContentWithSourceParams$(
        activatedRoute.queryParams,
        switchMap(({ slug, list }) =>
          combineLatest([
            storyService.getBySlug(slug),
            storylistService.get(list, 10),
          ])
        )
      )
      .pipe(takeUntilDestroyed());

    const content$ = isPlatformBrowser(platformId)
      ? fetchObservable$
      : macroTaskWrapperService.wrapMacroTaskObservable<[Story, StoryList]>(
          'StoryComponent.fetchData',
          fetchObservable$,
          null,
          'first-emit'
        );

    content$.subscribe(([story, storylist]) => {
      this.story = story;
      this.storylist = storylist;
      metaTagsDirective.setTitle(
        `${story.title}, de ${story.author.name} en La Cuentoneta`
      );
      metaTagsDirective.setDescription(
        `"${story.title}", de ${story.author.name}. Parte de la colección "${storylist.title}" en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`
      );
      this.shareContentParams = { slug: story.slug, list: storylist.slug };
      this.shareMessage = `Leí "${story.title}" de ${story.author.name} en La Cuentoneta y te lo comparto. Sumate a leer este y otros cuentos de la colección "${storylist.title}" en este link:`;
    });
  }
}

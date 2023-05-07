// Core
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, first, interval, switchMap, takeUntil } from 'rxjs';

// Models
import { Story } from '../../models/story.model';
import { StoryList } from '../../models/storylist.model';

// Services
import { StoryService } from '../../providers/story.service';

// Directives
import { DestroyedDirective } from '../../directives/destroyed.directive';
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { APP_ROUTE_TREE } from '../../app-routing.module';
import { MacroTaskWrapperService } from '../../providers/macro-task-wrapper.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'cuentoneta-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  hostDirectives: [
    DestroyedDirective,
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
    const destroyedDirective = inject(DestroyedDirective);
    const metaTagsDirective = inject(MetaTagsDirective);
    const storyService = inject(StoryService);
    const macroTaskWrapperService = inject(MacroTaskWrapperService);

    const fetchObservable$ = this.fetchContentDirective
      .fetchContentWithSourceParams$(
        activatedRoute.queryParams,
        switchMap(({ slug, list }) =>
          combineLatest([
            storyService.getBySlug(slug),
            storyService.getLatest(list, 10),
          ])
        )
      )
      .pipe(takeUntil(destroyedDirective.destroyed$));

    if (!isPlatformBrowser(platformId)) {
      macroTaskWrapperService
        .wrapMacroTaskObservable<any>(
          'StoryComponent.fetchData',
          interval(2000).pipe(first()),
          null,
          'first-emit'
        )
        .subscribe(() => {

          metaTagsDirective.setTitle(
            `Title has changed!`
          );
          metaTagsDirective.setDescription(
            `Description has changed!`
          );
        });
    }

    if (isPlatformBrowser(platformId)) {
      fetchObservable$.subscribe(([story, storylist]) => {
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
}

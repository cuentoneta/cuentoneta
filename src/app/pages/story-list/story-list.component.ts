// Core
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, takeUntil } from 'rxjs';

// Models
import { StoryList } from '../../models/storylist.model';

// Services
import { StoryService } from '../../providers/story.service';

// Directives
import { DestroyedDirective } from '../../directives/destroyed.directive';
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { isPlatformBrowser } from '@angular/common';
import { MacroTaskWrapperService } from '../../providers/macro-task-wrapper.service';
import { Story } from '../../models/story.model';

@Component({
  selector: 'cuentoneta-story-list',
  templateUrl: './story-list.component.html',
  styleUrls: ['./story-list.component.scss'],
  hostDirectives: [
    DestroyedDirective,
    FetchContentDirective,
    MetaTagsDirective,
  ],
})
export class StoryListComponent {
  fetchContentDirective = inject(FetchContentDirective<StoryList>);
  storyList!: StoryList | undefined;

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
        switchMap(({ slug }) => {
          return storyService.getLatest(slug, 60);
        })
      )
      .pipe(takeUntil(destroyedDirective.destroyed$));

    if (!isPlatformBrowser(platformId)) {
      macroTaskWrapperService
        .wrapMacroTaskObservable<StoryList>(
          'StoryListComponent.fetchData',
          fetchObservable$,
          null,
          'first-emit'
        )
        .subscribe((storylist) => {
          this.storyList = storylist;
          metaTagsDirective.setTitle(`"${storylist.title}" en La Cuentoneta`);
          metaTagsDirective.setDescription(
            `Colección "${storylist.title}", una storylist en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`
          );
        });
    }

    if (isPlatformBrowser(platformId)) {
      fetchObservable$.subscribe((storylist) => {
        this.storyList = storylist;
        metaTagsDirective.setTitle(`"${storylist.title}" en La Cuentoneta`);
        metaTagsDirective.setDescription(
          `Colección "${storylist.title}", una storylist en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`
        );
      });
    }
  }
}

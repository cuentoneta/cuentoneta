// Core
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, switchMap, takeUntil } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

// Models
import { StoryList } from '../../models/storylist.model';

// Services
import { MacroTaskWrapperService } from '../../providers/macro-task-wrapper.service';
import { StorylistService } from '../../storylist.service';

// Directives
import { DestroyedDirective } from '../../directives/destroyed.directive';
import { FetchContentDirective } from '../../directives/fetch-content.directive';
import { MetaTagsDirective } from '../../directives/meta-tags.directive';

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
  storylist!: StoryList | undefined;

  constructor() {
    const platformId = inject(PLATFORM_ID);
    const activatedRoute = inject(ActivatedRoute);
    const destroyedDirective = inject(DestroyedDirective);
    const metaTagsDirective = inject(MetaTagsDirective);
    const storylistService = inject(StorylistService);
    const macroTaskWrapperService = inject(MacroTaskWrapperService);

    const fetchObservable$: Observable<StoryList> = this.fetchContentDirective
      .fetchContentWithSourceParams$<StoryList>(
        activatedRoute.queryParams,
        switchMap(({ slug }) => storylistService.get(slug, 60, 'asc'))
      )
      .pipe(takeUntil(destroyedDirective.destroyed$));

    // TODO: Mover discriminación entre client-side y server-side a directiva
    // En base a si la plataforma es browser o server, utiliza el wrapper de macro tasks en el segundo caso
    const storyList$ = isPlatformBrowser(platformId)
      ? fetchObservable$
      : macroTaskWrapperService.wrapMacroTaskObservable<StoryList>(
          'StoryListComponent.fetchData',
          fetchObservable$,
          null,
          'first-emit'
        );

    storyList$.subscribe((storylist) => {
      this.storylist = storylist;
      metaTagsDirective.setTitle(`"${storylist.title}" en La Cuentoneta`);
      metaTagsDirective.setDescription(
        `Colección "${storylist.title}", una storylist en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`
      );
    });
  }
}

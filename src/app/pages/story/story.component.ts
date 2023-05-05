// Core
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
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
import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { APP_ROUTE_TREE } from '../../app-routing.module';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { MacroTaskWrapperService } from '../../providers/macro-task-wrapper.service';

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
export class StoryComponent implements OnInit {
  readonly appRouteTree = APP_ROUTE_TREE;
  fetchContentDirective = inject(FetchContentDirective<[Story, StoryList]>);

  story!: Story;
  storylist!: StoryList;

  dummyList = Array(10);
  shareContentParams: { [key: string]: string } = {};
  shareMessage: string = '';

  private platformId = inject(PLATFORM_ID);
  private activatedRoute = inject(ActivatedRoute);
  private destroyedDirective = inject(DestroyedDirective);
  private metaTagsDirective = inject(MetaTagsDirective);
  private storyService = inject(StoryService);
  private macroTaskWrapperService = inject(MacroTaskWrapperService);

  ngOnInit() {

    if (isPlatformServer(this.platformId)) {
      this.macroTaskWrapperService.wrapMacroTaskObservable(
        'MyComponent.ngOnInit',
        this.fetchData$()
      );
      // If any tasks have started outside of the component use this:
      this.macroTaskWrapperService.awaitMacroTasks('StoryComponent.ngOnInit');
    }

    this.fetchData$().subscribe(([story, storylist]) => {
      this.story = story;
      this.storylist = storylist;
      this.metaTagsDirective.setTitle(
        `${story.title}, de ${story.author.name} en La Cuentoneta`
      );
      this.metaTagsDirective.setDescription(
        `"${story.title}", de ${story.author.name}. Parte de la colección "${storylist.title}" en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`
      );
      this.shareContentParams = { slug: story.slug, list: storylist.slug };
      this.shareMessage = `Leí "${story.title}" de ${story.author.name} en La Cuentoneta y te lo comparto. Sumate a leer este y otros cuentos de la colección "${storylist.title}" en este link:`;
    });
  }

  private fetchData$() {
    return this.fetchContentDirective
      .fetchContentWithSourceParams$<[Story, StoryList]>(
        this.activatedRoute.queryParams,
        switchMap(({ slug, list }) =>
          combineLatest([
            this.storyService.getBySlug(slug),
            this.storyService.getLatest(list, 10),
          ])
        )
      )
      .pipe(takeUntil(this.destroyedDirective.destroyed$));
  }
}

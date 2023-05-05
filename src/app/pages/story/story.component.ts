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
import { MetaTagsDirective } from '../../directives/meta-tags.directive';
import { APP_ROUTE_TREE } from '../../app-routing.module';
import { waitFor } from '../../functions/ssr.functions';

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

  private prom: any;
  private metaTagsDirective = inject(MetaTagsDirective);

  constructor() {
    const activatedRoute = inject(ActivatedRoute);
    const destroyedDirective = inject(DestroyedDirective);
    const storyService = inject(StoryService);

    const fetchData$ = this.fetchContentDirective
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

    this.prom = waitFor(fetchData$);
  }

  async ngOnInit() {
    const [story, storylist] = await this.prom;
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
  }
}

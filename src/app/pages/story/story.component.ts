// Core
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, switchMap, takeUntil } from 'rxjs';

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
export class StoryComponent implements OnInit {
  readonly appRouteTree = APP_ROUTE_TREE;
  fetchContentDirective = inject(FetchContentDirective<[Story, StoryList]>);

  story!: Story;
  storylist!: StoryList;

  dummyList = Array(10);
  shareContentParams: { [key: string]: string } = {};
  shareMessage: string = '';

  private activatedRoute = inject(ActivatedRoute);
  private destroyedDirective = inject(DestroyedDirective);
  private metaTagsDirective = inject(MetaTagsDirective);
  private storyService = inject(StoryService);

  constructor() {}

  async ngOnInit(): Promise<void> {


    const fetchData$: Observable<[Story, StoryList]> =
      this.fetchContentDirective
        .fetchContentWithSourceParams$(
          this.activatedRoute.queryParams,
          switchMap(({ slug, list }) =>
            combineLatest([
              this.storyService.getBySlug(slug),
              this.storyService.getLatest(list, 10),
            ])
          )
        )
        .pipe(takeUntil(this.destroyedDirective.destroyed$));

    const [story, storylist] = await waitFor(fetchData$);
    this.story = story;
    this.storylist = storylist;
    this.metaTagsDirective.setTitle(
      `${story.title}, de ${story.author.name} en La Cuentoneta`
    );
    this.metaTagsDirective.setDescription(
      `"${story.title}", de ${story.author.name}. Parte de la colección "${storylist.title}" en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`
    );
    this.shareContentParams = { slug: story.slug, list: storylist.slug };
    this.shareMessage = `Leí "${story.title}" de ${story.author.name} en La Cuentoneta y te lo comparto. Sumate a leer este y otros cuentos de ${storylist.title} en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.`;
  }
}

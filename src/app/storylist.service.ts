import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Publication, Storylist, StorylistDTO } from './models/storylist.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { StoryCard } from './models/story.model';
import { environment } from './environments/environment';
import { StoryService } from './providers/story.service';

@Injectable({
  providedIn: 'root',
})
export class StorylistService {
  private readonly prefix = `${environment.apiUrl}api/storylist`;
  private http = inject(HttpClient);
  private storyService = inject(StoryService);

  public get(
    slug: string,
    amount: number = 5,
    ordering: 'asc' | 'desc' = 'asc'
  ): Observable<Storylist> {
    const params = new HttpParams()
      .set('slug', slug)
      .set('amount', amount)
      .set('ordering', ordering);
    return this.http
      .get<StorylistDTO>(`${this.prefix}`, { params })
      .pipe(
        map((storyList) => ({
          ...storyList,
          publications: storyList.publications.map((publication) => ({
            ...publication,
            story: this.storyService.parseStoryCardContent(publication.story),
          })) as Publication<StoryCard>[],
        }))
      );
  }

  public getPreview(slug: string): Observable<Storylist> {
    const params = new HttpParams().set('slug', slug);
      return this.http
          .get<StorylistDTO>(`${this.prefix}/preview`, { params })
          .pipe(
              map((storyList) => ({
                  ...storyList,
                  publications: storyList.publications.map((publication) => ({
                      ...publication,
                      story: this.storyService.parseStoryCardContent(publication.story),
                  })) as Publication<StoryCard>[],
              }))
          );
  }
}

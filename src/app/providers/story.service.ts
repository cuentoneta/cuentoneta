import { Injectable } from '@angular/core';
import { Story, StoryCard, StoryDTO } from '../models/story.model';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Publication,
  StoryList,
  StoryListDTO,
} from '../models/storylist.model';

@Injectable({ providedIn: 'root' })
export class StoryService {
  constructor(private http: HttpClient) {}
  public getBySlug(slug: string): Observable<Story> {
    const params = new HttpParams().set('slug', slug);
    return this.http
      .get<StoryDTO>(`api/story/read`, { params })
      .pipe(map((story) => this.parseStoryContent(story)));
  }

  // ToDo: Rediseñar funcionamiento del endpoint de autores.
  public getAuthors(): Observable<Story[]> {
    return this.http.get<Story[]>(`api/story/authors`);
  }

  // ToDo: Rediseñar funcionamiento del endpoint de links originales.
  public getOriginalLinks(): Observable<any> {
    return this.http.get<Story[]>(`api/story/original-links`);
  }

  public getLatest(slug: string, amount: number = 5): Observable<StoryList> {
    const params = new HttpParams().set('slug', slug).set('amount', amount);
    return this.http.get<StoryListDTO>(`api/story/latest`, { params }).pipe(
      map((storyList) => ({
        ...storyList,
        publications: storyList.publications.map((publication) => ({
          ...publication,
          story: this.parseStoryCardContent(publication.story),
        })) as Publication<StoryCard>[],
      }))
    );
  }

  private parseStoryCardContent(story: StoryDTO): StoryCard {
    return {
      ...story,
      prologues: story.prologues ?? [],
      paragraphs:
        story?.paragraphs?.map((x: string) => this.parseParagraph(x)) ?? [],
      summary:
        story?.summary?.map((x: string) => this.parseParagraph(x))?.pop() ?? '',
    };
  }

  private parseStoryContent(story: StoryDTO): Story {
    return {
      ...story,
      prologues: story.prologues ?? [],
      paragraphs:
        story?.paragraphs?.map((x: string) => this.parseParagraph(x)) ?? [],
      summary:
        story?.summary?.map((x: string) => this.parseParagraph(x))?.pop() ?? '',
      author: {
        ...story.author,
        biography: this.parseParagraph(story.author.biography),
      },
    };
  }

  private parseParagraph(block: any): string {
    let paragraph = '';

    // Condición de escape en caso de que se pase como parámetro un string plano en vez de un blockContent
    if (typeof block === 'string') {
      return block;
    }

    block.children.forEach((x: any) => {
      let part = x.text;
      if (x.marks.includes('em')) {
        part = this.addEmphasis(part);
      }
      if (x.marks.includes('strong')) {
        part = this.addStrong(part);
      }
      paragraph = paragraph.concat(part);
    });
    return paragraph;
  }

  private addEmphasis(text: string): string {
    return `<i>${text}</i>`;
  }

  private addStrong(text: string): string {
    return `<strong>${text}</strong>`;
  }
}

// Core
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

// Environment
import { environment } from '../environments/environment';

// Models
import { Story, StoryCard, StoryDTO } from '../models/story.model';

@Injectable({ providedIn: 'root' })
export class StoryService {
  private readonly prefix = `${environment.apiUrl}api/story`;
  constructor(private http: HttpClient) {}
  public getBySlug(slug: string): Observable<Story> {
    const params = new HttpParams().set('slug', slug);
    return this.http
      .get<StoryDTO>(`${this.prefix}/read`, { params })
      .pipe(map((story) => this.parseStoryContent(story)));
  }

  // ToDo: Rediseñar funcionamiento del endpoint de autores.
  public getAuthors(): Observable<Story[]> {
    return this.http.get<Story[]>(`${this.prefix}/authors`);
  }

  // ToDo: Rediseñar funcionamiento del endpoint de links originales.
  public getOriginalLinks(): Observable<any> {
    return this.http.get<Story[]>(`${this.prefix}/original-links`);
  }

  public parseStoryCardContent(story: StoryDTO): StoryCard {
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

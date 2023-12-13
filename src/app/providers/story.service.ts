// Core
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

// Environment
import { environment } from '../environments/environment';

// Models
import { Paragraph, Story, StoryCard, StoryDTO } from '@models/story.model';
import { Block, BlockContent } from '@models/block-content.model';

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
  public getOriginalLinks(): Observable<Story[]> {
    return this.http.get<Story[]>(`${this.prefix}/original-links`);
  }

  public parseStoryCardContent(story: StoryDTO): StoryCard {
    return {
      ...story,
      prologues: story.prologues ?? [],
      paragraphs:
        story?.paragraphs?.map((x: BlockContent) => this.parseParagraph(x)) ??
        [],
      summary:
        story?.summary?.map((x: BlockContent) => this.parseParagraph(x)) ?? [],
    };
  }

  private parseStoryContent(story: StoryDTO): Story {
    return {
      ...story,
      prologues: story.prologues ?? [],
      paragraphs:
        story?.paragraphs?.map((x: BlockContent) => this.parseParagraph(x)) ??
        [],
      summary:
        story?.summary?.map((x: BlockContent) => this.parseParagraph(x)) ?? [],
      author: {
        ...story.author,
        biography:
          story.author.biography?.map((x) => this.parseParagraph(x)) ?? [],
      },
    };
  }

  private parseParagraph(block: BlockContent): Paragraph {
    let paragraph = '';
    let classes: string[] = [];

    block.children.forEach((x: Block) => {
      let part = x.text;

      // Comprobación de estilos de texto y aplicación de la transformación correspondiente
      if (x.marks?.includes('em')) {
        part = this.addItalics(part);
      }

      if (x.marks?.includes('strong')) {
        part = this.addBold(part);
      }

      // Transformación de salto de línea en texto dentro del mismo párrafo
      part = part.replaceAll('\n', '<br/>');

      // Asignación de clases para modificar estilos del texto
      // TODO: Utilizar mark particular en BlockContent para centrar cualquier tipo de texto a futuro
      if (x.text?.includes('***')) {
        classes = classes.concat(['text-center']);
      }

      paragraph = paragraph.concat(part);
    });
    return { classes: classes.join(' '), text: paragraph };
  }

  private addItalics(text: string): string {
    return `<i>${text}</i>`;
  }

  private addBold(text: string): string {
    return `<b>${text}</b>`;
  }
}

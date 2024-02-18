// Core
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

// Environment
import { environment } from '../environments/environment';

// Models
import { Paragraph, Story, StoryCard, StoryDTO } from '@models/story.model';
import { Block, BlockContent, MarkDef } from '@models/block-content.model';
import { Media, MediaTypes, SpaceRecording } from '@models/media.model'

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

  public parseStoryCardContent(story: StoryDTO): StoryCard {
    return {
      ...story,
      author: {
        ...story.author,
        imageUrl: this.parseAvatarImageUrl(story.author.imageUrl),
      },
      prologues: story.prologues ?? [],
      paragraphs:
        story?.paragraphs?.map((x: BlockContent) => this.parseParagraph(x)) ??
        [],
      summary:
        story?.summary?.map((x: BlockContent) => this.parseParagraph(x)) ?? [],
      media: story.media?.map((x) => this.mediaTypesAdapter(x)) ?? []
    };
  }

  private parseStoryContent(story: StoryDTO): Story {
    return {
      ...story,
      prologues: story.prologues ?? [ ],
      paragraphs:
        story?.paragraphs?.map((x: BlockContent) => this.parseParagraph(x)) ??
        [],
      summary:
        story?.summary?.map((x: BlockContent) => this.parseParagraph(x)) ?? [],
      author: {
        ...story.author,
        imageUrl: this.parseAvatarImageUrl(story.author.imageUrl),
        biography:
          story.author.biography?.map((x) => this.parseParagraph(x)) ?? [],
      },
      media: story.media?.map((x) => this.mediaTypesAdapter(x)) ?? []
    };
  }

  private parseAvatarImageUrl(imageUrl: string | undefined): string {
    return imageUrl ?? 'assets/img/default-avatar.webp';
  }

  private parseParagraph(blockContent: BlockContent): Paragraph {
    let paragraph = '';
    let classes: string[] = [];

    blockContent.markDefs;

    blockContent.children.forEach((block: Block) => {
      let part = block.text;

      part = this.parseBlockTextStyleMarks(block, part);
      part = this.parseBlockTextMarkDefs(
        part,
        block.marks ?? [],
        blockContent.markDefs ?? []
      );

      // Transformación de salto de línea en texto dentro del mismo párrafo
      part = part.replaceAll('\n', '<br/>');

      // Asignación de clases para modificar estilos del texto
      // TODO: Utilizar mark particular en BlockContent para centrar cualquier tipo de texto a futuro
      if (block.text?.includes('***')) {
        classes = classes.concat(['text-center']);
      }

      paragraph = paragraph.concat(part);
    });
    return { classes: classes.join(' '), text: paragraph };
  }

  /**
   * Método encargado de procesar los estilos estáticos de texto soportados por Sanity
   * Genera tags HTML para los estilos de texto en negrita e itálica
   * // TODO: Soportar los restantes estilos de texto del tipo BlockContent en Sanity
   * @param block
   * @param part
   * @private
   */
  private parseBlockTextStyleMarks(block: Block, part: string = ''): string {
    const marks = block.marks ?? [];

    if(block.marks?.length === 0) return part;

    marks.forEach((mark) => {
      switch (mark) {
        case 'em':
          part = this.addItalics(part);
          break;
        case 'strong':
          part = this.addBold(part);
          break;
        default:
          break;
      }
    });

    return part;
  }

  private parseBlockTextMarkDefs(
      text: string,
      marks: string[],
      markDefs: MarkDef[]
  ): string {
    if (markDefs.length === 0 || marks.length === 0) return text;

    markDefs.forEach((markDef) => {
      if (marks.includes(markDef._key)) {
        switch (markDef._type) {
          case 'link':
            text = this.addUrlLink(text, markDef.href);
            break;
          default:
            break;
        }
      }
    });

    return text;
  }

  private addItalics(text: string): string {
    return `<i>${text}</i>`;
  }

  private addBold(text: string): string {
    return `<b>${text}</b>`;
  }

  private addUrlLink(text: string, url: string): string {
    return `<a href="${url}">${text}</a>`;
  }

  /**
   * Adaptador utilizado para mappear los distintos tipos de media que
   * pueden existir en la plataforma a su tipo específico.
   * @param media
   * @private
   */
  private mediaTypesAdapter(media: Media): MediaTypes {

    if(media.type === 'spaceRecording'){
      return media as SpaceRecording
    } else{
      throw new Error(`El tipo ${media.type} no está soportado.`);
    }
  }
}

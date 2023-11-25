// Conexión a Sanity
import { client } from './_helpers/sanity-connector';

// Utilidades
import { mapAuthor, mapPrologues } from './_utils/functions';

// Modelos
import { StoryDTO } from '@models/story.model';

async function fetchForRead(req: any, res: any): Promise<StoryDTO> {
  {
    const { slug } = req.query;
    const query = `*[_type == 'story' && slug.current == '${slug}']
                          {
                              'slug':slug.current,
                              title, 
                              language,
                              originalLink, 
                              videoUrl,
                              badLanguage,
                              forewords, 
                              categories, 
                              body, 
                              review, 
                              forewords, 
                              approximateReadingTime,
                              'author': author-> { ..., nationality-> }
                          }[0]`;
    const story = await client.fetch(query, {});

    const { body, review, author, forewords, ...properties } = story;

    return {
      ...properties,
      author: mapAuthor(author, properties.language),
      prologues: mapPrologues(forewords),
      paragraphs: body,
      summary: review,
    };
  }
}

export { fetchForRead };

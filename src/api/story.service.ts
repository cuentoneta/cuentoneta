import { client } from './_helpers/sanity-connector';
import { mapAuthor, mapPrologues } from './_utils/functions';

async function fetchForRead(req: any, res: any) {
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

    res.json({
      ...properties,
      author: mapAuthor(author, properties.language),
      prologues: mapPrologues(forewords),
      paragraphs: body,
      summary: review,
    });
  }
}



export { fetchForRead }

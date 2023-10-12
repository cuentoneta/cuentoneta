import { client } from './_helpers/sanity-connector';
import { mapAuthor, mapPrologues } from './_utils/functions';

async function fetchForRead(req: any, res: any) {
  {
    const { slug } = req.query;
    const query = `*[_type == 'story' && slug.current == '${slug}']
                          {
                              'slug':slug.current,
                              title, 
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

    res.json({
      ...story,
      summary: story.review,
      paragraphs: story.body,
      author: mapAuthor(story.author),
      prologues: mapPrologues(story.forewords),
    });
  }
}



export { fetchForRead }

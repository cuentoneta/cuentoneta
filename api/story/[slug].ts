import { mapAuthor, mapPrologues } from '../functions';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { client } from '../_helpers/sanity-connector';

export default async function getBySlug(req: VercelRequest, res: VercelResponse) {
    const { slug } = req.query;
    const query = `*[_type == 'story' && slug.current == '${slug}']
                          {
                              title, 
                              day, 
                              originalLink, 
                              forewords, 
                              categories, 
                              publishedAt, 
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

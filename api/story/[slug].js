import { mapAuthor, mapBodyToParagraphs, mapPrologues } from '../functions';

const sanityConnector = require('../_helpers/sanity-connector');

export default async function getBySlug(req, res) {
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
                              'author': author-> { ..., nationality-> }
                          }[0]`;
    const story = await sanityConnector.client.fetch(query, {});

    res.json({
        ...story,
        summary: story.review,
        paragraphs: mapBodyToParagraphs(story.body),
        author: mapAuthor(story.author),
        prologues: mapPrologues(story.forewords),
    });
}

const sanityConnector = require('../_helpers/sanity-connector');
const { mapAuthor } = require('../functions');

export default async function get(req, res) {
    const query = `*[_type == 'story'] | order(day desc) {title, day, categories, publishedAt, author->}`;
    const authors = await sanityConnector.client.fetch(query, {});
    res.json(authors.map((x) => ({ ...x, author: mapAuthor(x.author) })));
}

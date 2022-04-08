const sanityConnector = require('../_helpers/sanity-connector');

export default async function getOriginalLinks(req, res) {
    const query = `*[_type == 'story'] | order(day desc) {title, day, author->, originalLink}`;
    const result = await sanityConnector.client.fetch(query, {});
    res.json(result);
}

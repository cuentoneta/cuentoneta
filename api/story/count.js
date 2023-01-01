const sanityConnector = require('../_helpers/sanity-connector');

export default async function get(req, res) {
    const { edition } = req.query;
    const query = `count(*[_type == 'story' && edition == '${edition}'])`;
    const result = await sanityConnector.client.fetch(query, {});
    res.send(result);
}

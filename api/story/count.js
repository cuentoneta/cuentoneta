const sanityConnector = require('../_helpers/sanity-connector');

export default async function get(req, res) {
  const query = `count(*[_type == 'story'])`;
  const result = await sanityConnector.client.fetch(query, {});
  res.send(result);
}

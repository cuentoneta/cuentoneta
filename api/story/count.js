const sanityConnector = require('../_helpers/sanity-connector');

export default async function get(req, res) {
  const query = `count(*[_type == 'story' && edition == 2021])`;
  const result = await sanityConnector.client.fetch(query, {});
  res.send(result);
}

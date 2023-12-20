import { client } from './_helpers/sanity-connector';
import express from 'express';

export async function fetchLandingPageContent(
  req: express.Request,
  res: express.Response
) {
  const query = `*[_type == 'landingPage'] {
            'previews': previews[]->,
            'cards': cards[]->
        }[0]`;

  const result = await client.fetch(query, {});

  if (!result) {
    res.json(null);
  }

  return res.json(result);
}

module.exports = {
  fetchLandingPageContent,
};

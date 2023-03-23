import { VercelRequest, VercelResponse } from '@vercel/node';
import { client } from '../_helpers/sanity-connector';

export default async function get(req: VercelRequest, res: VercelResponse) {
    const query = `count(*[_type == 'story'])`;
    const result = await client.fetch(query, {});
    res.send(result);
}

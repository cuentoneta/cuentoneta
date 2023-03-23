import { client } from '../_helpers/sanity-connector';
import {VercelRequest, VercelResponse} from '@vercel/node';

export default async function get(req: VercelRequest, res: VercelResponse) {
    const query = `*[_type == 'story'] | order(day desc) {title, day, author->, originalLink}`;
    const result = await client.fetch(query, {});
    res.json(result);
}

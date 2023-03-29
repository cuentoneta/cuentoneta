// Core
import { VercelRequest, VercelResponse } from '@vercel/node';

// Environment
import { environment } from './_helpers/environment';

// Interfaces
import { ContentConfig } from '../src/app/models/content.model';

export default async function contentConfig(req: VercelRequest, res: VercelResponse) {
    const contentConfig: ContentConfig = environment.contentConfig;
    res.json(contentConfig);
}

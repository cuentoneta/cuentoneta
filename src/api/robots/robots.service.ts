import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { TEnvironmentType } from '../../../scripts/vercel-environments.model';

async function initializeRobotsTxt() {
	const robotsTxtPath = join(dirname('.'), 'robots.txt');
	return await readFile(robotsTxtPath, 'utf8');
}

async function getRobotsTxt() {
	const environment = (process.env['NODE_ENV'] || 'development') as TEnvironmentType;
	return environment === 'production' ? initializeRobotsTxt() : 'User-agent: *\nDisallow: /';
}

export { getRobotsTxt };

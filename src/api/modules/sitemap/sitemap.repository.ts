// Sanity
import { client } from '../../_helpers/sanity-connector';

// Queries
import { sitemapSlugsQuery } from 'src/api/_queries/sitemap.query';

export async function fetchSitemapSlugs() {
	return client.fetch(sitemapSlugsQuery);
}

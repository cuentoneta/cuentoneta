import { createClient, SanityClient } from '@sanity/client';
import { environment } from './environment';

export const client: SanityClient = createClient({
	projectId: environment.sanity.projectId,
	dataset: environment.sanity.dataset,
	token: environment.sanity.token,
	apiVersion: '2021-10-21', // use current UTC date - see "specifying API version"!
	useCdn: environment.production, // `false` if you want to ensure fresh data
});

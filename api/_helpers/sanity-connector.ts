import sanityClient, { SanityClient } from '@sanity/client';
import { environment } from './environment';

export const client: SanityClient = sanityClient({
    projectId: environment.sanity.projectId,
    dataset: environment.sanity.dataset,
    apiVersion: '2019-01-29', // use current UTC date - see "specifying API version"!
    useCdn: environment.production, // `false` if you want to ensure fresh data
});

import { router } from './trpc';
import { authorRouter } from './routers/author.router';
import { storyRouter } from './routers/story.router';
import { storylistRouter } from './routers/storylist.router';
import { contributorRouter } from './routers/contributor.router';
import { contentRouter } from './routers/content.router';

export const appRouter = router({
	author: authorRouter,
	story: storyRouter,
	storylist: storylistRouter,
	contributor: contributorRouter,
	content: contentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

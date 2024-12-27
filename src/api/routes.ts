import authorController from './author/author.controller';
import contentController from './content/content.controller';
import ogController from './og.controller';
import storyController from './story/story.controller';
import storylistController from './storylist/storylist.controller';
import robotsController from './robots/robots.controller';

const apiPrefix = '/api';
const apiRoutes = [
	{
		path: '/author',
		controller: authorController,
	},
	{
		path: '/content',
		controller: contentController,
	},
	{
		path: '/og',
		controller: ogController,
	},
	{
		path: '/story',
		controller: storyController,
	},
	{
		path: '/storylist',
		controller: storylistController,
	},
].map((route) => ({ ...route, path: `${apiPrefix}${route.path}` }));

const utilityRoutes = [
	{
		path: '/robots.txt',
		controller: robotsController,
	},
];

export default [...apiRoutes, ...utilityRoutes];

import authorController from './author/author.controller';
import contentController from './content/content.controller';
import ogController from './og.controller';
import storyController from './story/story.controller';
import storylistController from './storylist/storylist.controller';

export default [
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
];

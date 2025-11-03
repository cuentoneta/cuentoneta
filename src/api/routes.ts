import authorController from './modules/author/author.controller';
import contentController from './modules/content/content.controller';
import contributorController from './modules/contributor/contributor.controller';
import ogController from './og.controller';
import storyController from './modules/story/story.controller';
import storylistController from './modules/storylist/storylist.controller';

export default [
	{
		path: '/author',
		controller: authorController,
	},
	{
		path: '/contributor',
		controller: contributorController,
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

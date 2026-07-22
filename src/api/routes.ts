import { Hono } from 'hono';
import authorController from './modules/author/author.controller';
import contentController from './modules/content/content.controller';
import contributorController from './modules/contributor/contributor.controller';
import literaryWorkController from './modules/literary-work/literary-work.controller';
import ogController from './og.controller';
import storyController from './modules/story/story.controller';
import storylistController from './modules/storylist/storylist.controller';

const apiRoutes = new Hono();

apiRoutes.route('/author', authorController);
apiRoutes.route('/contributor', contributorController);
apiRoutes.route('/content', contentController);
apiRoutes.route('/literary-work', literaryWorkController);
apiRoutes.route('/og', ogController);
apiRoutes.route('/story', storyController);
apiRoutes.route('/storylist', storylistController);

export default apiRoutes;

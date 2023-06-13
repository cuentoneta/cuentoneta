import storyController from './story.controller';
import storylistController from './storylist.controller';

export default [
  {
    path: '/story',
    controller: storyController,
  },
  {
    path: '/storylist',
    controller: storylistController,
  },
];

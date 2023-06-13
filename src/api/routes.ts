import ogController from './og.controller';
import storyController from './story.controller';
import storylistController from './storylist.controller';


export default [
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

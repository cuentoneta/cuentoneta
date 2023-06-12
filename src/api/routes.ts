import storyController from './story.controller';
import ogController from './og.controller';

export default [
  {
    path: '/story',
    controller: storyController,
  },
  {
    path: '/og',
    controller: ogController,
  },
];

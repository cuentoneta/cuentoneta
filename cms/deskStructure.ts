import { activeLandingItem } from './structure/active-landing-item';
import { configurationItem } from './structure/configuration-item';
import { contentItem } from './structure/content-item';

export default (S, context) =>
	S.list()
		.title('Content')
		.items([activeLandingItem(S, context), configurationItem(S, context), contentItem(S, context)]);

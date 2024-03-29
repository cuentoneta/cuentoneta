import { Rettiwt } from 'rettiwt-api';
import { environment } from '../_helpers/environment';
import { Media, SpaceRecordingSchemaObject } from '@models/media.model';

export async function getTweetData(
	mediaSource: SpaceRecordingSchemaObject,
): Promise<Media> {
	const rettiwt = new Rettiwt({
		apiKey: environment.twitter.apiKey,
	});

	const tweetData = await rettiwt.tweet.details(mediaSource.postId);
	return {
		title: mediaSource.title,
		type: 'spaceRecording',
		data: { ...tweetData, duration: mediaSource.duration },
		icon: mediaSource.icon
	};
}

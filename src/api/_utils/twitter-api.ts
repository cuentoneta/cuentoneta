import { Rettiwt } from 'rettiwt-api';
import { environment } from '../_helpers/environment';
import { Media } from '@models/media.model'

export async function getTweetData(
	// TODO: Tipar parámetro de la función
	spaceData: any,
): Promise<Media> {
	const rettiwt = new Rettiwt({
		apiKey: environment.twitter.apiKey,
	});

	const tweetData = await rettiwt.tweet.details(spaceData.spacesRecordingId);
	return { title: spaceData.title, type: 'spaceRecording', data: tweetData, url: spaceData.spacesRecordingUrl };
}

import { Rettiwt } from 'rettiwt-api';
import { environment } from '../_helpers/environment';
import { Media } from '@models/media.model';

export async function getTweetData(
	spaceData: SpaceData,
): Promise<Media> {
	const rettiwt = new Rettiwt({
		apiKey: environment.twitter.apiKey,
	});

	const tweetData = await rettiwt.tweet.details(spaceData.postId);
	return {
		title: spaceData.title,
		type: 'spaceRecording',
		data: { ...tweetData, duration: spaceData.duration },
		url: spaceData.postUrl,
	};
}

// TODO: #539 - Generar modelos de entidades manejadas por el backend en base a los schemas de Sanity
interface SpaceData {
	title: string;
	postId: string;
	postUrl: string;
	duration: string;
}

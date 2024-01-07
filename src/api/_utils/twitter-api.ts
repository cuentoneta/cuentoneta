import { Rettiwt, Tweet } from 'rettiwt-api';
import { environment } from '../_helpers/environment'

export async function getTweetData(id: string): Promise<Tweet> {
	const rettiwt = new Rettiwt({
		apiKey: environment.twitter.apiKey,
	});
	return await rettiwt.tweet.details(id);
}

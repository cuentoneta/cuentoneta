import { purgeLiteraryWorkCache } from './cache-purge.service';
import { SpyCachePurgeRepository } from './cache-purge.repository.mock';

describe('purgeLiteraryWorkCache', () => {
	it('traduce el slug al tag de la obra y delega en el repository', async () => {
		const repository = new SpyCachePurgeRepository();

		await purgeLiteraryWorkCache('la-obra', repository);

		expect(repository.purgedTags).toEqual(['literary-work:la-obra']);
	});
});

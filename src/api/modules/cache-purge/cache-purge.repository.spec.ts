import { VercelCachePurgeRepository } from './cache-purge.repository';

describe('VercelCachePurgeRepository', () => {
	it('delega en la función de purga inyectada con el tag recibido', async () => {
		const purgedTags: string[] = [];
		const repository = new VercelCachePurgeRepository(async (tag) => {
			purgedTags.push(tag as string);
		});

		await repository.purgeByTag('literary-work:la-obra');

		expect(purgedTags).toEqual(['literary-work:la-obra']);
	});
});

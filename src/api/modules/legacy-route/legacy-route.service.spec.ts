import { fn } from '@test-utils';
import type { fetchMigratedSlug } from './legacy-route.repository';
import { resolveLegacySlug } from './legacy-route.service';

const stubFetchSlug = (answer: () => Promise<string | null>) => fn<typeof fetchMigratedSlug>(answer);

describe('resolveLegacySlug', () => {
	it('resolves to the slug of the migrated document', async () => {
		const fetchSlug = stubFetchSlug(() => Promise.resolve('onoff-renombre-final'));

		expect(await resolveLegacySlug('story', 'onoff-renombre-intermedio', fetchSlug)).toBe('onoff-renombre-final');
		expect(fetchSlug).toHaveBeenCalledWith('story', 'onoff-renombre-intermedio');
	});

	it('keeps the legacy slug when nothing was migrated from it', async () => {
		const fetchSlug = stubFetchSlug(() => Promise.resolve(null));

		expect(await resolveLegacySlug('storylist', 'verano-2022', fetchSlug)).toBe('verano-2022');
	});

	it('lets a Sanity error through', async () => {
		const failure = new Error('Sanity no responde');
		const fetchSlug = stubFetchSlug(() => Promise.reject(failure));

		await expect(resolveLegacySlug('story', 'el-fin', fetchSlug)).rejects.toBe(failure);
	});
});

import { createLiteraryWorkController } from './literary-work.controller';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';
import { rawLiteraryWork } from '../../_mocks/literary-work-raw.mock';

describe('literaryWorkController', () => {
	const controller = createLiteraryWorkController(new InMemoryLiteraryWorkRepository([rawLiteraryWork]));

	it('returns the whole work for an existing slug', async () => {
		const response = await controller.request('/la-vigilia-de-onoff');
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.slug).toBe('la-vigilia-de-onoff');
		expect(body.sectionCount).toBe(2);
		expect(body.content).toHaveLength(2);
	});

	it('returns a single-section projection with whole-work metadata for ?section', async () => {
		const response = await controller.request('/la-vigilia-de-onoff?section=1');
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.content).toHaveLength(1);
		expect(body.content[0].position).toBe(1);
		expect(body.sectionCount).toBe(2);
	});

	it('responds 404 with an error envelope for an unknown slug', async () => {
		const response = await controller.request('/no-existe');
		const body = await response.json();

		expect(response.status).toBe(404);
		expect(body.error).toContain('no-existe');
	});

	it('responds 404 for a section out of range', async () => {
		const response = await controller.request('/la-vigilia-de-onoff?section=99');

		expect(response.status).toBe(404);
	});

	it('responds 400 for a malformed section param', async () => {
		const negative = await controller.request('/la-vigilia-de-onoff?section=-1');
		const alphabetic = await controller.request('/la-vigilia-de-onoff?section=abc');

		expect(negative.status).toBe(400);
		expect(alphabetic.status).toBe(400);
	});
});

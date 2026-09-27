/**
 * Tests e2e de SEO para `/about`, que se mantiene fuera del índice.
 */
import { expect } from '@playwright/test';

import { test } from '../_utils/test';

import { getMetaContent } from '../_utils/seo';

test('about — sirve noindex, nofollow en el HTML server-rendered', async ({ request }) => {
	const response = await request.get('/about');
	expect(response.status(), '/about no respondió 200').toBe(200);

	// Igualdad y no `toContain('noindex')`: también tiene que fallar si la página pasa a `noindex, follow`.
	expect(getMetaContent(await response.text(), 'robots')).toBe('noindex, nofollow');
});

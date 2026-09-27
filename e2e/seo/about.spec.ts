/**
 * Tests e2e de SEO para `/about`, que se mantiene fuera del índice.
 */
import { expect } from '@playwright/test';

import { test } from '../_utils/test';

import { getMetaContent } from '../_utils/seo';

test('about — sirve noindex, nofollow en el HTML server-rendered', async ({ request }) => {
	// Una build no indexable sirve `noindex, nofollow` en toda página, sin importar lo que pida cada una:
	// ahí la aserción de abajo pasaría sin verificar nada. Una página indexable sirviendo `index` descarta ese caso.
	const indexable = await request.get('/authors');
	expect(getMetaContent(await indexable.text(), 'robots'), 'la build no es indexable').not.toContain('noindex');

	const response = await request.get('/about');
	expect(response.status(), '/about no respondió 200').toBe(200);

	// Igualdad y no `toContain('noindex')`: también tiene que fallar si la página pasa a `noindex, follow`.
	expect(getMetaContent(await response.text(), 'robots')).toBe('noindex, nofollow');
});

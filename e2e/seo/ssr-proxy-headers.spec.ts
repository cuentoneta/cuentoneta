/**
 * Test e2e de regresión del deopt-a-CSR por proxy headers (Vercel).
 *
 * El hardening SSR de Angular (`AngularAppEngine`) descarta a client-side rendering
 * (`serveClientSidePage()` → `index.csr.html`, sin contenido ni meta por página) cuando llega
 * un header `x-forwarded-*` no declarado como confiable. Vercel termina TLS y **siempre** agrega
 * `x-forwarded-for`, así que sin `trustProxyHeaders` en `src/server.ts` toda request de producción
 * deopteaba a CSR y los crawlers recibían el shell genérico → desindexación.
 *
 * Este test simula ese header y verifica que el SSR igual sirve el HTML por página (título y
 * canónica del cuento, no el shell genérico de home). Si alguien quita `trustProxyHeaders: true`,
 * el server deoptea y este test falla.
 */
import { test, expect } from '@playwright/test';

import { getTitleText, getCanonicalHref } from '../_utils/seo';
import { STABLE_SLUGS } from '../_utils/seo-fixtures';

const storyPath = `/story/${STABLE_SLUGS.story}`;

// `x-forwarded-for` es el header que Vercel agrega a toda request y que dispara el deopt si no se
// confía (no está en el set confiable por default de Angular). Se omite `x-forwarded-proto: https`
// a propósito: en el dev server (http) forzaría el self-fetch del SSR a `https://localhost` y
// fallaría por TLS — un artefacto de dev ajeno a lo que este test verifica (el deopt por proxy).
const proxyHeaders = { 'x-forwarded-for': '66.249.66.1' };

test('SSR con x-forwarded-for sirve el HTML por página, no el shell CSR genérico', async ({ request }) => {
	const html = await (await request.get(storyPath, { headers: proxyHeaders })).text();

	// Afirma sobre el mecanismo: el deopt sirve el shell CSR (`ng-server-context="ssg"`); el SSR
	// real lo marca como `"ssr"`.
	expect(html).toContain('ng-server-context="ssr"');
	// Y sobre el efecto observable: título y canónica del cuento, no el genérico de home.
	expect(getTitleText(html)).toMatch(/aleph/i);
	expect(getCanonicalHref(html)).toContain(storyPath);
});

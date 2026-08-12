import type { LandingPageContentQueryResult } from '@sanity-types';
import { onoffRawLandingPageMock as generatedLandingPage } from './onoff/landing-page/landing-page.raw.mock';

// El agregador existe para que `src/api/` pueda consumir el corpus: la regla de ESLint le prohíbe alcanzar
// una pieza de `onoff/` por su ruta, y los agregadores de este nivel son la puerta prevista. Se declara una
// const propia en vez de re-exportar, que la prohibición de barrels rechaza.
export const onoffRawLandingPageMock: NonNullable<LandingPageContentQueryResult> = generatedLandingPage;

// La campaña no tiene agregador propio porque no tiene query propia: es sub-proyección de la de landing, y
// separarlas dejaría un módulo cuyo valor sale entero de este. El `_id` que el modelo de dominio no tiene
// —lo corta el ACL— viene de la query, no de una invención del mock: es lo que le da filo al test de
// contrato del mapper.
export const onoffRawContentCampaignsMock = onoffRawLandingPageMock.campaigns;

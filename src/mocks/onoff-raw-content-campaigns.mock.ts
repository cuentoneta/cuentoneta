import { onoffRawLandingPageMock } from './onoff/landing-page/landing-page.raw.mock';

// El `_id` que el modelo de dominio no tiene —lo corta el ACL— viene de la query, no de una invención
// del mock: es lo que le da filo al test de contrato del mapper.
export const onoffRawContentCampaignsMock = onoffRawLandingPageMock.campaigns;

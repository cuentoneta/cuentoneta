import type { LandingPageContentQueryResult } from '@sanity-types';
import { onoffRawLandingPageMock as generatedLandingPage } from './onoff/landing-page/landing-page.raw.mock';

export const onoffRawLandingPageMock: NonNullable<LandingPageContentQueryResult> = generatedLandingPage;

// La campaña no tiene agregador propio porque no tiene query propia: es sub-proyección de la de landing, y
// separarlas dejaría un módulo cuyo valor sale entero de este.
export const onoffRawContentCampaignsMock = onoffRawLandingPageMock.campaigns;

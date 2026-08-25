/**
 * Fixture de la obra estable para los e2e de la página de lectura.
 *
 * La identidad sale de `STABLE_SLUGS.literaryWork`; todo lo demás se resuelve en runtime contra el API,
 * para que las aserciones se deriven de lo que el dataset efectivamente sirve y no de prosa clavada en el
 * spec. Las propiedades de curaduría que la obra necesita cumplir (formatos multimedia, otra obra del
 * autor) las afirman guardas propias del spec: acá sólo se trae el dato.
 */
import type { APIRequestContext } from '@playwright/test';

import { literaryWorkDtoSchema, type LiteraryWorkDto } from '@models/literary-work.dto';

import { STABLE_SLUGS } from './seo-fixtures';

const STABLE_LITERARY_WORK_ROUTE = `/api/literary-work/${STABLE_SLUGS.literaryWork}`;

/**
 * La obra estable tal como la entrega el API, o `undefined` si el dataset no la tiene.
 *
 * Sólo el 404 se traduce a `undefined` —es el estado que la guarda del spec reporta como fixture
 * ausente—; cualquier otro fallo lanza, porque un API caído no es una obra ausente y confundirlos
 * haría que la guarda diagnostique curaduría donde hay infraestructura.
 */
export async function fetchStableLiteraryWork(request: APIRequestContext): Promise<LiteraryWorkDto | undefined> {
	const response = await request.get(STABLE_LITERARY_WORK_ROUTE);
	if (response.status() === 404) {
		return undefined;
	}
	if (response.status() !== 200) {
		throw new Error(`"${STABLE_LITERARY_WORK_ROUTE}" respondió ${response.status()}: el API no está sirviendo obras`);
	}

	// Un cambio de contrato llega como error de contrato, no como una aserción comparando contra undefined.
	const parsed = literaryWorkDtoSchema.safeParse(await response.json());
	if (!parsed.success) {
		throw new Error(`"${STABLE_LITERARY_WORK_ROUTE}" no cumple el contrato de la obra: ${parsed.error.message}`);
	}
	return parsed.data;
}

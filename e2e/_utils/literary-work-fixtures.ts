/**
 * Fixtures de obras para los e2e de la página de lectura.
 *
 * La identidad sale de los slugs estables de `seo-fixtures`; todo lo demás se resuelve en runtime contra
 * el API, para que las aserciones se deriven de lo que el dataset efectivamente sirve y no de prosa
 * clavada en el spec. Las propiedades de curaduría que cada obra necesita cumplir (formatos multimedia,
 * otra obra del autor) las afirman guardas propias del spec: acá sólo se trae el dato.
 */
import type { APIRequestContext } from '@playwright/test';

import { literaryWorkDtoSchema, type LiteraryWorkDto } from '@models/literary-work.dto';

/**
 * Una obra tal como la entrega el API, o `undefined` si el dataset no la tiene.
 *
 * Sólo el 404 se traduce a `undefined` —es el estado que la guarda del spec reporta como fixture
 * ausente—; cualquier otro fallo lanza, porque un API caído no es una obra ausente y confundirlos
 * haría que la guarda diagnostique curaduría donde hay infraestructura.
 */
export async function fetchLiteraryWork(
	request: APIRequestContext,
	slug: string,
): Promise<LiteraryWorkDto | undefined> {
	const route = `/api/literary-work/${slug}`;
	const response = await request.get(route);
	if (response.status() === 404) {
		return undefined;
	}
	if (response.status() !== 200) {
		throw new Error(`"${route}" respondió ${response.status()}: el API no está sirviendo obras`);
	}

	// Un cambio de contrato llega como error de contrato, no como una aserción comparando contra undefined.
	const parsed = literaryWorkDtoSchema.safeParse(await response.json());
	if (!parsed.success) {
		throw new Error(`"${route}" no cumple el contrato de la obra: ${parsed.error.message}`);
	}
	return parsed.data;
}

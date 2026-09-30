export class ClarityRequestError extends Error {
	constructor(public readonly status: number) {
		super(`Clarity API responded with status ${status}`);
		this.name = 'ClarityRequestError';
	}
}

// El contrato de la respuesta cambió o no es el esperado: distingue "Clarity cambió" de "Clarity no
// contestó" o "rechazó la credencial".
export class ClarityResponseError extends Error {
	constructor(detail: string, options?: { cause?: unknown }) {
		super(`Clarity API returned an unexpected response: ${detail}`, options);
		this.name = 'ClarityResponseError';
	}
}

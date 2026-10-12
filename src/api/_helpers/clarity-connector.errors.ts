export class ClarityRequestError extends Error {
	constructor(
		public readonly status: number,
		statusText = '',
		body = '',
	) {
		super(`Clarity respondió ${status} ${statusText}: ${body}`);
		this.name = 'ClarityRequestError';
	}
}

// Clarity contestó con éxito pero la respuesta no tiene la forma esperada: distingue "Clarity cambió
// su contrato" de "Clarity rechazó la petición" (`ClarityRequestError`).
export class ClarityResponseError extends Error {
	constructor(detail: string, options?: { cause?: unknown }) {
		super(`Clarity API returned an unexpected response: ${detail}`, options);
		this.name = 'ClarityResponseError';
	}
}

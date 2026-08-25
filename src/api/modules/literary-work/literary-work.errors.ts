export class LiteraryWorkNotFoundError extends Error {
	constructor(slug: string) {
		super(`LiteraryWork with slug "${slug}" not found`);
		this.name = 'LiteraryWorkNotFoundError';
	}
}

// Distingue "el dato existe pero no permite construir la vista" de "no existe": la obra está en el
// content lake y es la curaduría la que quedó inconsistente. Nombra a la obra culpable y preserva la
// causa, que es lo que después vuelve útil el registro del descarte.
export class MalformedLiteraryWorkError extends Error {
	constructor(
		public readonly slug: string,
		options?: { cause?: unknown },
	) {
		super(`LiteraryWork with slug "${slug}" is malformed`, options);
		this.name = 'MalformedLiteraryWorkError';
	}
}

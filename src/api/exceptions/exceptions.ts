export class InternalError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'Internal server error';
	}
}

export class NotFoundError extends InternalError {
	constructor(message: string) {
		super(message);
		this.name = 'Not found error';
	}
}

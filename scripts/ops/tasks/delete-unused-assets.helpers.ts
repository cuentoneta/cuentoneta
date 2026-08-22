export function isInsufficientPermissionsError(error: unknown): error is Error {
	return error instanceof Error && error.message.includes('Insufficient permissions');
}

export class UnknownError extends Error {
	code = 500

	constructor() {
		super()
	}
}

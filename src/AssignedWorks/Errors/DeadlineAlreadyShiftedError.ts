export class DeadlineAlreadyShiftedError extends Error {
	code = 409

	constructor() {
		super()
	}
}

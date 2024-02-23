type HandlerFunction = (error: Error, ctx: any) => void

export const Catch = (
	errorType: any,
	handler: HandlerFunction
): any => {
	return (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) => {
		// Method decorator
		if (descriptor) {
			return _generateDescriptor(descriptor, errorType, handler)
		}

		// Class decorator
		else {
			// Iterate over class properties except constructor
			for (const propertyName of Reflect.ownKeys(
				target.prototype
			).filter((prop) => prop !== 'constructor')) {
				const desc = Object.getOwnPropertyDescriptor(
					target.prototype,
					propertyName
				)!

				const isMethod = desc.value instanceof Function

				if (!isMethod) continue

				Object.defineProperty(
					target.prototype,
					propertyName,
					_generateDescriptor(desc, errorType, handler)
				)
			}
		}
	}
}

function _generateDescriptor(
	descriptor: PropertyDescriptor,
	errorType: any,
	handler: HandlerFunction
): PropertyDescriptor {
	const originalMethod = descriptor.value

	descriptor.value = function (...args: any[]) {
		try {
			const result = originalMethod.apply(this, args)

			if (result && result instanceof Promise) {
				return result.catch((error: any) => {
					_handleError(this, errorType, handler, error)
				})
			}

			return result
		} catch (error: any) {
			_handleError(this, errorType, handler, error)
		}
	}

	return descriptor
}

function _handleError(
	ctx: any,
	errorType: any,
	handler: HandlerFunction,
	error: Error
) {
	if (typeof handler === 'function' && error instanceof errorType) {
		handler.call(null, error, ctx)
	} else {
		throw error
	}
}

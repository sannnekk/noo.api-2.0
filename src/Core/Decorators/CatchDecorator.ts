type HandlerFunction = (error: Error, ctx: any) => void

function handleError(
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

function generateDescriptor(
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
          handleError(this, errorType, handler, error)
        })
      }

      return result
    } catch (error: any) {
      handleError(this, errorType, handler, error)
    }
  }

  return descriptor
}

export const Catch = (errorType: any, handler: HandlerFunction): any => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // Method decorator
    if (descriptor) {
      return generateDescriptor(descriptor, errorType, handler)
    }

    // Iterate over class properties except constructor
    for (const propertyName of Reflect.ownKeys(target.prototype).filter(
      (prop) => prop !== 'constructor'
    )) {
      const desc = Object.getOwnPropertyDescriptor(
        target.prototype,
        propertyName
      )!

      const isMethod = desc.value instanceof Function

      if (!isMethod) continue

      Object.defineProperty(
        target.prototype,
        propertyName,
        generateDescriptor(desc, errorType, handler)
      )
    }
  }
}

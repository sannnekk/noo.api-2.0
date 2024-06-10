function handleError(ctx, errorType, handler, error) {
    if (typeof handler === 'function' && error instanceof errorType) {
        handler.call(null, error, ctx);
    }
    else {
        throw error;
    }
}
function generateDescriptor(descriptor, errorType, handler) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        try {
            const result = originalMethod.apply(this, args);
            if (result && result instanceof Promise) {
                return result.catch((error) => {
                    handleError(this, errorType, handler, error);
                });
            }
            return result;
        }
        catch (error) {
            handleError(this, errorType, handler, error);
        }
    };
    return descriptor;
}
export const Catch = (errorType, handler) => {
    return (target, propertyKey, descriptor) => {
        // Method decorator
        if (descriptor) {
            return generateDescriptor(descriptor, errorType, handler);
        }
        // Iterate over class properties except constructor
        for (const propertyName of Reflect.ownKeys(target.prototype).filter((prop) => prop !== 'constructor')) {
            const desc = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
            const isMethod = desc.value instanceof Function;
            if (!isMethod)
                continue;
            Object.defineProperty(target.prototype, propertyName, generateDescriptor(desc, errorType, handler));
        }
    };
};

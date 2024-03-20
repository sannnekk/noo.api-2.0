export const Catch = (errorType, handler) => {
    return (target, propertyKey, descriptor) => {
        // Method decorator
        if (descriptor) {
            return _generateDescriptor(descriptor, errorType, handler);
        }
        // Class decorator
        else {
            // Iterate over class properties except constructor
            for (const propertyName of Reflect.ownKeys(target.prototype).filter((prop) => prop !== 'constructor')) {
                const desc = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
                const isMethod = desc.value instanceof Function;
                if (!isMethod)
                    continue;
                Object.defineProperty(target.prototype, propertyName, _generateDescriptor(desc, errorType, handler));
            }
        }
    };
};
function _generateDescriptor(descriptor, errorType, handler) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        try {
            const result = originalMethod.apply(this, args);
            if (result && result instanceof Promise) {
                return result.catch((error) => {
                    _handleError(this, errorType, handler, error);
                });
            }
            return result;
        }
        catch (error) {
            _handleError(this, errorType, handler, error);
        }
    };
    return descriptor;
}
function _handleError(ctx, errorType, handler, error) {
    if (typeof handler === 'function' && error instanceof errorType) {
        handler.call(null, error, ctx);
    }
    else {
        throw error;
    }
}

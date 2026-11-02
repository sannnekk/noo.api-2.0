export function isDeltaEmpty(delta) {
    if (!delta) {
        return true;
    }
    for (const op of delta.ops) {
        if (op?.insert instanceof Object) {
            return false;
        }
        if (String(op?.insert).trim() !== '') {
            return false;
        }
    }
    return true;
}
export function toDelta(content) {
    return {
        ops: [
            {
                insert: content ?? '\n',
            },
        ],
    };
}

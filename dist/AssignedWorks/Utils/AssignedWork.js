export function workAlreadyChecked(work) {
    return work.checkedAt !== null;
}
export function workAlreadyMade(work) {
    return work.solvedAt !== null;
}

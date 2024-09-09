import type { AssignedWork } from '../Data/AssignedWork'

export function workAlreadyChecked(work: AssignedWork): boolean {
  return work.checkedAt !== null
}

export function workAlreadyMade(work: AssignedWork): boolean {
  return work.solvedAt !== null
}

import type { WorkTask } from '@modules/Works/Data/Relations/WorkTask'

export function isAutomaticallyCheckable(type: WorkTask['type']): boolean {
  return type === 'word'
}

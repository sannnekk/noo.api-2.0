import { type DeltaContentType } from '../Data/DeltaContentType'

export function isDeltaEmpty(
  delta: DeltaContentType | null | undefined
): boolean {
  if (!delta) {
    return true
  }

  for (const op of delta.ops) {
    if (op?.insert instanceof Object) {
      return false
    }

    if (String(op?.insert).trim() !== '') {
      return false
    }
  }

  return true
}

export function toDelta(content: string | null | undefined): DeltaContentType {
  return {
    ops: [
      {
        insert: content ?? '\n',
      },
    ],
  }
}

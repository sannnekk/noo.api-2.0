interface Op {
  insert?: string | object
  delete?: number
  retain?: number
  attributes?: {
    [key: string]: any
  }
}

export interface DeltaContentType {
  ops: Op[]
}

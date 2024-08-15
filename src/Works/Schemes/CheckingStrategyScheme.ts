import { z } from 'zod'

export const CheckingStrategyScheme = z.enum([
  'type1',
  'type2',
  'type3',
  'type4',
])

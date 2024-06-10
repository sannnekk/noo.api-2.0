import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { z } from 'zod'
import { StatisticsOptions } from './DTO/StatisticsOptions'

@ErrorConverter()
export class StatisticsValidator extends Validator {
  public statisticsOptionsScheme = z.object({
    from: z.date(),
    to: z.date(),
    type: z.string().optional(), // TODO: use enum from work module
  })

  public parseGetStatistics(data: unknown): StatisticsOptions {
    return this.parse<StatisticsOptions>(data, this.statisticsOptionsScheme)
  }
}

import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { StatisticsOptions } from './DTO/StatisticsOptions'
import { StatisticsOptionsScheme } from './Schemes/StatisticsOptionsScheme'

@ErrorConverter()
export class StatisticsValidator extends Validator {
  public parseGetStatistics(data: unknown): StatisticsOptions {
    return this.parse<StatisticsOptions>(data, StatisticsOptionsScheme)
  }
}

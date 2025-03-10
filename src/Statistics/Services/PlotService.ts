import { Plot } from '../Types/Plot'
import Dates from '@modules/Core/Utils/date'

export class PlotService {
  public generatePlot<T>(
    name: string,
    items: T[],
    color: Plot['color'],
    keyFunc: (e: T) => string | Date,
    valFunc: (e: T) => number,
    annotationFunc?: (e: T) => string
  ): Plot {
    const data = items.map((item) => {
      let key = keyFunc(item)

      if (key instanceof Date) {
        key = Dates.format(key, 'YYYY-MM-DD')
      }

      return {
        key,
        value: valFunc(item),
        annotation: annotationFunc ? annotationFunc(item) : undefined,
      }
    })

    return {
      name,
      color,
      data,
    }
  }
}

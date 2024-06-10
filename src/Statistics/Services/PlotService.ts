import { Plot } from '../Data/Plot'

export class PlotService {
  public generatePlot<T>(
    name: string,
    items: T[],
    color: Plot['color'],
    keyFunc: (e: T) => string | Date,
    valFunc: (e: T) => number,
    annotationFunc?: (e: T) => string
  ): Plot {
    return {
      name,
      color,
      data: items.map((item) => {
        let key = keyFunc(item)

        if (key instanceof Date) {
          key = key.toISOString().split('T')[0]
        }

        return {
          key,
          value: valFunc(item),
          annotation: annotationFunc ? annotationFunc(item) : undefined,
        }
      }),
    }
  }
}

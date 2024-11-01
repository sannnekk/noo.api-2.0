import Dates from '../../Core/Utils/date.js';
export class PlotService {
    generatePlot(name, items, color, keyFunc, valFunc, annotationFunc) {
        const data = items.map((item) => {
            let key = keyFunc(item);
            if (key instanceof Date) {
                key = Dates.format(key, 'YYYY-MM-DD');
            }
            return {
                key,
                value: valFunc(item),
                annotation: annotationFunc ? annotationFunc(item) : undefined,
            };
        });
        return {
            name,
            color,
            data,
        };
    }
}

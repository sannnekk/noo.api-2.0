export class PlotService {
    generatePlot(name, items, color, keyFunc, valFunc, annotationFunc) {
        return {
            name,
            color,
            data: items.map((item) => {
                let key = keyFunc(item);
                if (key instanceof Date) {
                    key = key.toISOString().split('T')[0];
                }
                return {
                    key: key,
                    value: valFunc(item),
                    annotation: annotationFunc ? annotationFunc(item) : undefined,
                };
            }),
        };
    }
}

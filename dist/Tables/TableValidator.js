import { Validator } from '../Core/Request/Validator.js';
import { TableScheme } from './Schemes/TableScheme.js';
export class TableValidator extends Validator {
    parseTable(data) {
        return this.parse(data, TableScheme);
    }
}

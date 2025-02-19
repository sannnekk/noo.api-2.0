import { Repository } from '../../Core/Data/Repository.js';
import { TableCellModel } from './Relations/TableCellModel.js';
export class TableCellRepository extends Repository {
    constructor() {
        super(TableCellModel);
    }
}

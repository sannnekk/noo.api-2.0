import { Repository } from '../../Core/Data/Repository.js';
import { TableModel } from './TableModel.js';
export class TableRepository extends Repository {
    constructor() {
        super(TableModel);
    }
}

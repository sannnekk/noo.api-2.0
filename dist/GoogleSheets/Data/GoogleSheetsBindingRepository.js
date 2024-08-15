import { Repository } from '../../Core/Data/Repository.js';
import { GoogleSheetsBindingModel } from './GoogleSheetsBindingModel.js';
export class GoogleSheetsBindingRepository extends Repository {
    constructor() {
        super(GoogleSheetsBindingModel);
    }
}

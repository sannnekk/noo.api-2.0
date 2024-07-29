import { Repository } from '../../Core/Data/Repository.js';
import { GoogleDocsBindingModel } from './GoogleDocsBindingModel.js';
export class GoogleDocsBindingRepository extends Repository {
    constructor() {
        super(GoogleDocsBindingModel);
    }
}

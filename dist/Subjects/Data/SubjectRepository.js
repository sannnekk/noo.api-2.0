import { Repository } from '../../Core/Data/Repository.js';
import { SubjectModel } from './SubjectModel.js';
export class SubjectRepository extends Repository {
    constructor() {
        super(SubjectModel);
    }
}

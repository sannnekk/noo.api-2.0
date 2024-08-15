import { Repository } from '../../Core/Data/Repository.js';
import { SnippetModel } from './SnippetModel.js';
export class SnippetRepository extends Repository {
    constructor() {
        super(SnippetModel);
    }
}

import { Repository } from '../../Core/Data/Repository.js';
import { FAQArticleModel } from './FAQArticleModel.js';
export class FAQRepository extends Repository {
    constructor() {
        super(FAQArticleModel);
    }
}

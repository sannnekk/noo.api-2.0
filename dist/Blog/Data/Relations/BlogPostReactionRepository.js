import { Repository } from '../../../Core/Data/Repository.js';
import { BlogPostReactionModel } from './BlogPostReactionModel.js';
export class BlogPostReactionRepository extends Repository {
    constructor() {
        super(BlogPostReactionModel);
    }
}

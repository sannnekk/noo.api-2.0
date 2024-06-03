import { Repository } from '../../../Core/Data/Repository';
import { BlogPostReactionModel } from './BlogPostReactionModel';
export class BlogPostReactionRepository extends Repository {
    constructor() {
        super(BlogPostReactionModel);
    }
}

import { Repository } from '../../Core/Data/Repository.js';
import { BlogPostModel } from './BlogPostModel.js';
export class BlogPostRepository extends Repository {
    constructor() {
        super(BlogPostModel);
    }
}

import { Repository } from '../../Core/Data/Repository';
import { BlogPostModel } from './BlogPostModel';
export class BlogPostRepository extends Repository {
    constructor() {
        super(BlogPostModel);
    }
}

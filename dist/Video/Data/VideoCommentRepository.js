import { Repository } from '../../Core/Data/Repository.js';
import { VideoCommentModel } from './Relations/VideoCommentModel.js';
export class VideoCommentRepository extends Repository {
    constructor() {
        super(VideoCommentModel);
    }
}

import { Repository } from '../../Core/Data/Repository.js';
import { VideoSavingModel } from './Relations/VideoSavingModel.js';
export class VideoSavingRepository extends Repository {
    constructor() {
        super(VideoSavingModel);
    }
}

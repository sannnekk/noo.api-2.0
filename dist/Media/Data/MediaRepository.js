import { Repository } from '../../Core/Data/Repository.js';
import { MediaModel } from './MediaModel.js';
export class MediaRepository extends Repository {
    constructor() {
        super(MediaModel);
    }
}

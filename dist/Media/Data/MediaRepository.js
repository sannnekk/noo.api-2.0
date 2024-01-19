import { Repository } from '../../core/index.js';
import { MediaModel } from './MediaModel.js';
export class MediaRepository extends Repository {
    constructor() {
        super(MediaModel);
    }
}

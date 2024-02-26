import { Repository } from '@core';
import { MediaModel } from './MediaModel';
export class MediaRepository extends Repository {
    constructor() {
        super(MediaModel);
    }
}

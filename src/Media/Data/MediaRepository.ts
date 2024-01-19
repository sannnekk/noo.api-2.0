import { Repository } from '@core'
import { Media } from './Media'
import { MediaModel } from './MediaModel'

export class MediaRepository extends Repository<Media> {
	constructor() {
		super(MediaModel)
	}
}

import { Repository } from '@modules/Core/Data/Repository'
import { VideoModel } from './VideoModel'
import type { Video } from './Video'

export class VideoRepository extends Repository<Video> {
  public constructor() {
    super(VideoModel)
  }
}

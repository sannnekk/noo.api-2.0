import { Repository } from '@modules/Core/Data/Repository'
import { VideoSaving } from './Relations/VideoSaving'
import { VideoSavingModel } from './Relations/VideoSavingModel'

export class VideoSavingRepository extends Repository<VideoSaving> {
  public constructor() {
    super(VideoSavingModel)
  }
}

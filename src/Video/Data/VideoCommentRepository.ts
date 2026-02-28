import { Repository } from '@modules/Core/Data/Repository'
import { VideoComment } from './Relations/VideoComment'
import { VideoCommentModel } from './Relations/VideoCommentModel'

export class VideoCommentRepository extends Repository<VideoComment> {
  public constructor() {
    super(VideoCommentModel)
  }
}

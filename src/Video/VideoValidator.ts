import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Video } from './Data/Video'
import { VideoScheme } from './Schemes/VideoScheme'
import { VideoCommentScheme } from './Schemes/VideoCommentScheme'
import { VideoComment } from './Data/Relations/VideoComment'

@ErrorConverter()
export class VideoValidator extends Validator {
  public parseVideo(data: unknown): Video {
    return this.parse<Video>(data, VideoScheme)
  }

  public parseComment(data: unknown): VideoComment {
    return this.parse<VideoComment>(data, VideoCommentScheme)
  }
}

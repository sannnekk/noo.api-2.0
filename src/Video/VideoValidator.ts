import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Video } from './Data/Video'
import { VideoScheme } from './Schemes/VideoScheme'
import { VideoCommentScheme } from './Schemes/VideoCommentScheme'

@ErrorConverter()
export class VideoValidator extends Validator {
  public parseVideo(data: unknown): Video {
    return this.parse<Video>(data, VideoScheme)
  }

  public parseComment(data: unknown): string {
    return this.parse<string>(data, VideoCommentScheme)
  }
}

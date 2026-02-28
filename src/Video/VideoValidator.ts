import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Video } from './Data/Video'
import { VideoScheme } from './Schemes/VideoScheme'
import { VideoUpdateScheme } from './Schemes/VideoUpdateScheme'
import { VideoCommentScheme } from './Schemes/VideoCommentScheme'
import { VideoComment } from './Data/Relations/VideoComment'
import { VideoReaction } from './Data/Relations/VideoReaction'
import { SupportedReactionScheme } from './Schemes/SupportedReactionScheme'
import { z } from 'zod'

@ErrorConverter()
export class VideoValidator extends Validator {
  public parseVideo(data: unknown): Video {
    return this.parse<Video>(data, VideoScheme)
  }

  public parseVideoReaction(data: unknown): {
    reaction: VideoReaction['reaction']
  } {
    return this.parse<{ reaction: VideoReaction['reaction'] }>(
      data,
      z.object({
        reaction: SupportedReactionScheme,
      })
    )
  }

  public parseVideoUpdate(data: unknown): Video {
    return this.parse<Video>(data, VideoUpdateScheme)
  }

  public parseComment(data: unknown): VideoComment {
    return this.parse<VideoComment>(data, VideoCommentScheme)
  }
}

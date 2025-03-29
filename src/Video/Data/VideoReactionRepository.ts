import { Repository } from '@modules/Core/Data/Repository'
import { VideoReaction } from './Relations/VideoReaction'
import { VideoReactionModel } from './Relations/VideoReactionModel'
import { User } from '@modules/Users/Data/User'
import { Video } from './Video'

export class VideoReactionRepository extends Repository<VideoReaction> {
  public constructor() {
    super(VideoReactionModel)
  }

  public async getUserReaction(
    userId: User['id'],
    videoId: Video['id']
  ): Promise<VideoReaction['reaction'] | null> {
    const reaction = await this.findOne({
      user: { id: userId },
      video: { id: videoId },
    })

    if (reaction) {
      return reaction.reaction
    }

    return null
  }

  public async getVideoReactions(
    videoId: Video['id']
  ): Promise<Record<VideoReaction['reaction'], number>> {
    const query = this.queryBuilder('video_reaction')
      .select('video_reaction.reaction', 'type')
      .addSelect('COUNT(id)', 'count')
      .where('video_reaction.videoId = :videoId', { videoId })
      .groupBy('video_reaction.reaction')

    const reactions: {
      type: VideoReaction['reaction']
      count: number
    }[] = await query.getRawMany()

    const result = reactions.reduce(
      (acc, reaction) => {
        acc[reaction.type] = reaction.count
        return acc
      },
      {} as Record<VideoReaction['reaction'], number>
    )

    const allReactions = {
      like: 0,
      dislike: 0,
      happy: 0,
      sad: 0,
      mindblowing: 0,
    }

    return {
      ...allReactions,
      ...result,
    }
  }
}
